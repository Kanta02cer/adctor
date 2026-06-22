from __future__ import annotations

import asyncio
import json
import os
import uuid
from collections import deque
from collections.abc import Awaitable, Callable, Iterable, Mapping
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from enum import Enum
from typing import Any


class AIEngine(str, Enum):
    PERPLEXITY = "perplexity"
    GEMINI = "gemini"
    OPENAI = "openai"


DEFAULT_QUEUE_NAMES: dict[AIEngine, str] = {
    AIEngine.PERPLEXITY: "adctor-perplexity-crawl",
    AIEngine.GEMINI: "adctor-gemini-crawl",
    AIEngine.OPENAI: "adctor-openai-crawl",
}


@dataclass(frozen=True)
class EngineTask:
    id: str
    engine: AIEngine
    payload: dict[str, Any]
    queue_name: str
    schedule_time: datetime | None = None


@dataclass(frozen=True)
class DrainResult:
    processed: list[EngineTask] = field(default_factory=list)
    rate_limited: list[AIEngine] = field(default_factory=list)
    skipped_paused: list[AIEngine] = field(default_factory=list)


@dataclass
class EngineQueueState:
    max_concurrent: int = 1
    paused: bool = False
    paused_until: datetime | None = None


class EngineRateLimitError(Exception):
    def __init__(
        self,
        engine: AIEngine | str,
        retry_after_seconds: int = 60,
        message: str | None = None,
    ) -> None:
        self.engine = coerce_engine(engine)
        self.retry_after_seconds = retry_after_seconds
        super().__init__(message or f"{self.engine.value} rate limited")


TaskHandler = Callable[[EngineTask], Awaitable[None]]


class LocalEngineTaskQueue:
    def __init__(
        self,
        *,
        queue_names: Mapping[AIEngine | str, str] | None = None,
        max_concurrent_per_engine: Mapping[AIEngine | str, int] | None = None,
    ) -> None:
        self.queue_names = _merge_engine_mapping(DEFAULT_QUEUE_NAMES, queue_names)
        self._queues: dict[AIEngine, deque[EngineTask]] = {
            engine: deque() for engine in AIEngine
        }
        self._states: dict[AIEngine, EngineQueueState] = {}
        for engine in AIEngine:
            max_concurrent = 1
            if max_concurrent_per_engine and engine in _normalize_keys(max_concurrent_per_engine):
                max_concurrent = _normalize_keys(max_concurrent_per_engine)[engine]
            self._states[engine] = EngineQueueState(max_concurrent=max(1, max_concurrent))

    async def enqueue(
        self,
        engine: AIEngine | str,
        payload: Mapping[str, Any],
        *,
        schedule_time: datetime | None = None,
    ) -> EngineTask:
        ai_engine = coerce_engine(engine)
        task = EngineTask(
            id=str(uuid.uuid4()),
            engine=ai_engine,
            payload=dict(payload),
            queue_name=self.queue_names[ai_engine],
            schedule_time=schedule_time,
        )
        self._queues[ai_engine].append(task)
        return task

    async def pause_engine(
        self,
        engine: AIEngine | str,
        *,
        duration_seconds: int | None = None,
    ) -> None:
        ai_engine = coerce_engine(engine)
        state = self._states[ai_engine]
        state.paused = True
        state.paused_until = (
            datetime.now(UTC) + timedelta(seconds=duration_seconds)
            if duration_seconds is not None
            else None
        )

    async def resume_engine(self, engine: AIEngine | str) -> None:
        ai_engine = coerce_engine(engine)
        state = self._states[ai_engine]
        state.paused = False
        state.paused_until = None

    async def handle_rate_limit(
        self,
        engine: AIEngine | str,
        *,
        retry_after_seconds: int = 60,
    ) -> None:
        await self.pause_engine(engine, duration_seconds=retry_after_seconds)

    def is_paused(self, engine: AIEngine | str) -> bool:
        ai_engine = coerce_engine(engine)
        state = self._states[ai_engine]
        if not state.paused:
            return False
        if state.paused_until is not None and datetime.now(UTC) >= state.paused_until:
            state.paused = False
            state.paused_until = None
            return False
        return True

    def pending_count(self, engine: AIEngine | str) -> int:
        return len(self._queues[coerce_engine(engine)])

    def queue_depths(self) -> dict[str, int]:
        return {engine.value: len(queue) for engine, queue in self._queues.items()}

    async def drain_ready(
        self,
        handler: TaskHandler,
        *,
        engines: Iterable[AIEngine | str] | None = None,
    ) -> DrainResult:
        selected_engines = [coerce_engine(engine) for engine in engines] if engines else list(AIEngine)
        processed: list[EngineTask] = []
        rate_limited: list[AIEngine] = []
        skipped_paused: list[AIEngine] = []

        for engine in selected_engines:
            if self.is_paused(engine):
                skipped_paused.append(engine)
                continue

            batch = self._pop_ready_batch(engine)
            if not batch:
                continue

            outcomes = await asyncio.gather(
                *(self._execute_task(task, handler) for task in batch),
                return_exceptions=True,
            )
            retry_tasks: list[EngineTask] = []

            for task, outcome in zip(batch, outcomes, strict=True):
                if isinstance(outcome, EngineRateLimitError):
                    await self.handle_rate_limit(
                        outcome.engine,
                        retry_after_seconds=outcome.retry_after_seconds,
                    )
                    retry_tasks.append(task)
                    if outcome.engine not in rate_limited:
                        rate_limited.append(outcome.engine)
                    continue

                if isinstance(outcome, Exception):
                    self._queues[task.engine].appendleft(task)
                    raise outcome

                processed.append(task)

            for task in reversed(retry_tasks):
                self._queues[task.engine].appendleft(task)

        return DrainResult(
            processed=processed,
            rate_limited=rate_limited,
            skipped_paused=skipped_paused,
        )

    def _pop_ready_batch(self, engine: AIEngine) -> list[EngineTask]:
        queue = self._queues[engine]
        state = self._states[engine]
        now = datetime.now(UTC)
        batch: list[EngineTask] = []
        deferred: deque[EngineTask] = deque()

        while queue and len(batch) < state.max_concurrent:
            task = queue.popleft()
            if task.schedule_time is not None and task.schedule_time > now:
                deferred.append(task)
                continue
            batch.append(task)

        while deferred:
            queue.appendleft(deferred.pop())

        return batch

    async def _execute_task(self, task: EngineTask, handler: TaskHandler) -> None:
        await handler(task)


@dataclass(frozen=True)
class CloudTasksConfig:
    project_id: str
    location: str
    worker_url: str
    service_account_email: str | None = None
    queue_names: Mapping[AIEngine, str] = field(default_factory=lambda: DEFAULT_QUEUE_NAMES.copy())

    @classmethod
    def from_env(cls) -> "CloudTasksConfig":
        project_id = os.environ["GCP_PROJECT_ID"]
        location = os.getenv("GCP_LOCATION", "asia-northeast1")
        worker_url = os.environ["CLOUD_RUN_WORKER_URL"].rstrip("/")
        service_account_email = os.getenv("CLOUD_TASKS_SERVICE_ACCOUNT_EMAIL")
        queue_names = {
            AIEngine.PERPLEXITY: os.getenv(
                "CLOUD_TASKS_QUEUE_PERPLEXITY",
                DEFAULT_QUEUE_NAMES[AIEngine.PERPLEXITY],
            ),
            AIEngine.GEMINI: os.getenv(
                "CLOUD_TASKS_QUEUE_GEMINI",
                DEFAULT_QUEUE_NAMES[AIEngine.GEMINI],
            ),
            AIEngine.OPENAI: os.getenv(
                "CLOUD_TASKS_QUEUE_OPENAI",
                DEFAULT_QUEUE_NAMES[AIEngine.OPENAI],
            ),
        }
        return cls(
            project_id=project_id,
            location=location,
            worker_url=worker_url,
            service_account_email=service_account_email,
            queue_names=queue_names,
        )


class CloudTasksEngineTaskQueue:
    def __init__(self, config: CloudTasksConfig) -> None:
        self.config = config
        self._client = None

    async def enqueue(
        self,
        engine: AIEngine | str,
        payload: Mapping[str, Any],
        *,
        schedule_time: datetime | None = None,
    ) -> EngineTask:
        ai_engine = coerce_engine(engine)
        tasks_v2, timestamp_pb2, _ = _load_google_cloud_tasks()
        client = self._get_client()
        parent = self._queue_path(ai_engine)
        body = json.dumps(
            {"engine": ai_engine.value, **dict(payload)},
            ensure_ascii=False,
        ).encode("utf-8")
        task: dict[str, Any] = {
            "http_request": {
                "http_method": tasks_v2.HttpMethod.POST,
                "url": f"{self.config.worker_url}/api/v1/workers/crawl",
                "headers": {"Content-Type": "application/json"},
                "body": body,
            }
        }

        if self.config.service_account_email:
            task["http_request"]["oidc_token"] = {
                "service_account_email": self.config.service_account_email,
            }

        if schedule_time:
            timestamp = timestamp_pb2.Timestamp()
            timestamp.FromDatetime(schedule_time)
            task["schedule_time"] = timestamp

        response = await client.create_task(parent=parent, task=task)
        return EngineTask(
            id=response.name,
            engine=ai_engine,
            payload=dict(payload),
            queue_name=self.config.queue_names[ai_engine],
            schedule_time=schedule_time,
        )

    async def pause_engine(
        self,
        engine: AIEngine | str,
        *,
        duration_seconds: int | None = None,
    ) -> None:
        ai_engine = coerce_engine(engine)
        client = self._get_client()
        await client.pause_queue(name=self._queue_path(ai_engine))
        if duration_seconds is not None:
            asyncio.create_task(self._resume_later(ai_engine, duration_seconds))

    async def resume_engine(self, engine: AIEngine | str) -> None:
        client = self._get_client()
        await client.resume_queue(name=self._queue_path(coerce_engine(engine)))

    async def slow_down_engine(
        self,
        engine: AIEngine | str,
        *,
        max_dispatches_per_second: float,
    ) -> None:
        tasks_v2, _, field_mask_pb2 = _load_google_cloud_tasks()
        ai_engine = coerce_engine(engine)
        queue = tasks_v2.Queue(
            name=self._queue_path(ai_engine),
            rate_limits=tasks_v2.RateLimits(
                max_dispatches_per_second=max_dispatches_per_second,
            ),
        )
        update_mask = field_mask_pb2.FieldMask(
            paths=["rate_limits.max_dispatches_per_second"],
        )
        await self._get_client().update_queue(queue=queue, update_mask=update_mask)

    async def handle_rate_limit(
        self,
        engine: AIEngine | str,
        *,
        retry_after_seconds: int = 60,
    ) -> None:
        await self.pause_engine(engine, duration_seconds=retry_after_seconds)

    def _get_client(self) -> Any:
        if self._client is None:
            tasks_v2, _, _ = _load_google_cloud_tasks()
            self._client = tasks_v2.CloudTasksAsyncClient()
        return self._client

    def _queue_path(self, engine: AIEngine) -> str:
        tasks_v2, _, _ = _load_google_cloud_tasks()
        client = self._get_client()
        return client.queue_path(
            self.config.project_id,
            self.config.location,
            self.config.queue_names[engine],
        )

    async def _resume_later(self, engine: AIEngine, duration_seconds: int) -> None:
        await asyncio.sleep(duration_seconds)
        await self.resume_engine(engine)


def build_engine_task_queue_from_env() -> LocalEngineTaskQueue | CloudTasksEngineTaskQueue:
    backend = os.getenv("TASK_QUEUE_BACKEND", "local").strip().lower()
    if backend in {"cloud-tasks", "cloud_tasks", "gcp"}:
        return CloudTasksEngineTaskQueue(CloudTasksConfig.from_env())
    return LocalEngineTaskQueue()


def coerce_engine(engine: AIEngine | str) -> AIEngine:
    if isinstance(engine, AIEngine):
        return engine
    return AIEngine(str(engine).strip().lower())


def _normalize_keys(mapping: Mapping[AIEngine | str, Any]) -> dict[AIEngine, Any]:
    return {coerce_engine(key): value for key, value in mapping.items()}


def _merge_engine_mapping(
    defaults: Mapping[AIEngine, str],
    overrides: Mapping[AIEngine | str, str] | None,
) -> dict[AIEngine, str]:
    merged = dict(defaults)
    if overrides:
        merged.update(_normalize_keys(overrides))
    return merged


def _load_google_cloud_tasks() -> tuple[Any, Any, Any]:
    try:
        from google.cloud import tasks_v2
        from google.protobuf import field_mask_pb2, timestamp_pb2
    except ImportError as exc:
        raise RuntimeError(
            "google-cloud-tasks is required when TASK_QUEUE_BACKEND=cloud-tasks"
        ) from exc
    return tasks_v2, timestamp_pb2, field_mask_pb2
