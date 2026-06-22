from __future__ import annotations

import csv
import fnmatch
import uuid
from collections import defaultdict
from datetime import UTC, date, datetime, timedelta
from io import StringIO
from typing import Any, Literal

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

try:
    from .database import get_db, get_sessionmaker
    from .models import (
        AuditLog,
        CitationResult,
        Competitor,
        CrawlerEvent,
        Keyword,
        MeasurementJob,
        PPCEvent,
        PPCPriceRule,
        Project,
    )
    from .services import (
        AIEngine,
        CloudflareAICrawlControlClient,
        CloudflareAPIError,
        CloudflareConfigError,
        EngineRateLimitError,
        EngineTask,
        LocalEngineTaskQueue,
        PerplexityAPIError,
        PerplexityClient,
        PerplexityConfigError,
        PerplexityRateLimitError,
        build_engine_task_queue_from_env,
        build_prompt,
        parse_citations,
    )
    from .services.citations_parser import domain_matches_url, extract_citation_urls
except ImportError:
    from database import get_db, get_sessionmaker
    from models import (
        AuditLog,
        CitationResult,
        Competitor,
        CrawlerEvent,
        Keyword,
        MeasurementJob,
        PPCEvent,
        PPCPriceRule,
        Project,
    )
    from services import (
        AIEngine,
        CloudflareAICrawlControlClient,
        CloudflareAPIError,
        CloudflareConfigError,
        EngineRateLimitError,
        EngineTask,
        LocalEngineTaskQueue,
        PerplexityAPIError,
        PerplexityClient,
        PerplexityConfigError,
        PerplexityRateLimitError,
        build_engine_task_queue_from_env,
        build_prompt,
        parse_citations,
    )
    from services.citations_parser import domain_matches_url, extract_citation_urls

router = APIRouter(prefix="/api/v1", tags=["hackii"])
task_queue = build_engine_task_queue_from_env()

SOV_COLORS = ["#B89F5D", "#9E8448", "#D9C38E", "#4B4435", "#70644D", "#3B3830"]


class CompetitorCreate(BaseModel):
    domain: str = Field(min_length=1, max_length=255)


class KeywordCreate(BaseModel):
    keyword: str = Field(min_length=1, max_length=500)
    search_volume: int = Field(default=0, ge=0)
    query_template: str | None = None
    is_active: bool = True


class KeywordImportRequest(BaseModel):
    keywords: list[KeywordCreate] = Field(default_factory=list)
    csv_text: str | None = None


class CrawlRequest(BaseModel):
    engines: list[AIEngine] = Field(default_factory=lambda: [AIEngine.PERPLEXITY])
    keyword_ids: list[uuid.UUID] | None = None


class CrawlWorkerPayload(BaseModel):
    engine: AIEngine
    project_id: uuid.UUID
    keyword_id: uuid.UUID
    job_id: uuid.UUID | None = None
    keyword: str | None = None
    query_template: str | None = None
    target_domain: str | None = None
    answer_text: str | None = None
    raw_response: dict[str, Any] | list[Any] | None = None


class CrawlerEventCreate(BaseModel):
    observed_at: datetime | None = None
    source: str = Field(default="manual", max_length=80)
    host: str = Field(min_length=1, max_length=255)
    path: str = Field(default="/", max_length=2048)
    path_pattern: str | None = Field(default=None, max_length=500)
    method: str | None = Field(default=None, max_length=20)
    status_code: int = Field(default=200, ge=100, le=599)
    request_count: int = Field(default=1, ge=0)
    bytes_transferred: int = Field(default=0, ge=0)
    detection_id: str | None = Field(default=None, max_length=100)
    user_agent: str | None = None
    crawler_name: str = Field(min_length=1, max_length=255)
    operator: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=100)
    verified: bool = False
    ip_hash: str | None = Field(default=None, max_length=128)
    asn: str | None = Field(default=None, max_length=80)
    country: str | None = Field(default=None, min_length=2, max_length=2)
    referrer_host: str | None = Field(default=None, max_length=255)
    robots_status: Literal["allowed", "blocked", "violated", "unknown"] = "unknown"
    policy_action: Literal["allow", "block", "charge", "review", "monitor"] = "monitor"
    risk_level: Literal["low", "medium", "high", "review"] = "review"
    raw_event: dict[str, Any] = Field(default_factory=dict)


class PPCPriceRuleCreate(BaseModel):
    path_pattern: str = Field(min_length=1, max_length=500)
    operator: str | None = Field(default=None, max_length=255)
    crawler_name: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=100)
    action: Literal["allow", "block", "charge", "review"] = "review"
    currency: str = Field(default="JPY", min_length=3, max_length=3)
    price_minor: int = Field(default=0, ge=0)
    priority: int = Field(default=100, ge=0)
    is_active: bool = True
    reason: str | None = None


class PPCEventCreate(BaseModel):
    crawler_event_id: uuid.UUID | None = None
    price_rule_id: uuid.UUID | None = None
    observed_at: datetime | None = None
    crawler_name: str = Field(min_length=1, max_length=255)
    operator: str | None = Field(default=None, max_length=255)
    path: str = Field(default="/", max_length=2048)
    status_code: int = Field(default=402, ge=100, le=599)
    decision: Literal["candidate", "charged", "rejected", "blocked", "allowed", "review"]
    currency: str = Field(default="JPY", min_length=3, max_length=3)
    rule_price_minor: int | None = Field(default=None, ge=0)
    crawler_exact_price_minor: int | None = Field(default=None, ge=0)
    crawler_max_price_minor: int | None = Field(default=None, ge=0)
    signature_status: Literal["valid", "missing", "invalid", "not_applicable"] = "not_applicable"
    payment_header_signed: bool = False
    charge_status: Literal["not_attempted", "recorded", "reconciled", "payout_pending", "paid", "failed"] = "not_attempted"
    charge_reference: str | None = Field(default=None, max_length=255)
    rejection_reason: str | None = None
    raw_event: dict[str, Any] = Field(default_factory=dict)


class PPCDryRunRequest(BaseModel):
    path: str = Field(default="/", max_length=2048)
    operator: str | None = Field(default=None, max_length=255)
    crawler_name: str = Field(default="UnknownCrawler", max_length=255)
    category: str | None = Field(default=None, max_length=100)
    verified: bool = False
    crawler_exact_price_minor: int | None = Field(default=None, ge=0)
    crawler_max_price_minor: int | None = Field(default=None, ge=0)
    signature_status: Literal["valid", "missing", "invalid", "not_applicable"] = "not_applicable"
    payment_header_signed: bool = False


class CloudflareSyncRequest(BaseModel):
    zone_id: str = Field(min_length=1)
    start: datetime
    end: datetime
    limit: int = Field(default=5000, ge=1, le=5000)


class HackIIRealtimeManager:
    def __init__(self) -> None:
        self.active: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, project_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active[project_id].append(websocket)

    def disconnect(self, project_id: str, websocket: WebSocket) -> None:
        if websocket in self.active[project_id]:
            self.active[project_id].remove(websocket)

    async def broadcast(self, project_id: str, payload: dict[str, Any]) -> None:
        for websocket in list(self.active[project_id]):
            try:
                await websocket.send_json(payload)
            except Exception:
                self.disconnect(project_id, websocket)


hackii_realtime = HackIIRealtimeManager()


@router.websocket("/ws/hackii/{project_id}")
async def hackii_project_ws(websocket: WebSocket, project_id: str) -> None:
    await hackii_realtime.connect(project_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        hackii_realtime.disconnect(project_id, websocket)


@router.get("/projects")
async def list_projects(db: AsyncSession = Depends(get_db)) -> list[dict[str, Any]]:
    projects = await _load_projects(db)
    return [_serialize_project(project) for project in projects]


@router.post("/projects/{project_id}/competitors")
async def add_competitor(
    project_id: uuid.UUID,
    body: CompetitorCreate,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    project = await db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    competitor = Competitor(project_id=project_id, domain=_normalize_input_domain(body.domain))
    db.add(competitor)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Competitor already exists")
    await db.refresh(competitor)
    return {"id": str(competitor.id), "domain": competitor.domain}


@router.delete("/projects/{project_id}/competitors/{competitor_ref}")
async def delete_competitor(
    project_id: uuid.UUID,
    competitor_ref: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    filters = [Competitor.project_id == project_id]
    try:
        competitor_id = uuid.UUID(competitor_ref)
        filters.append(Competitor.id == competitor_id)
    except ValueError:
        filters.append(Competitor.domain == _normalize_input_domain(competitor_ref))

    result = await db.execute(delete(Competitor).where(*filters))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Competitor not found")
    await db.commit()
    return {"deleted": True}


@router.post("/projects/{project_id}/keywords")
async def import_keywords(
    project_id: uuid.UUID,
    body: KeywordImportRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    project = await db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    incoming = list(body.keywords)
    if body.csv_text:
        incoming.extend(_parse_keyword_csv(body.csv_text))

    if not incoming:
        raise HTTPException(status_code=400, detail="No keywords provided")

    existing_result = await db.execute(select(Keyword.keyword).where(Keyword.project_id == project_id))
    existing = {row[0] for row in existing_result.all()}

    created = 0
    skipped = 0
    for item in incoming:
        keyword_text = item.keyword.strip()
        if keyword_text in existing:
            skipped += 1
            continue
        db.add(
            Keyword(
                project_id=project_id,
                keyword=keyword_text,
                search_volume=item.search_volume,
                query_template=item.query_template,
                is_active=item.is_active,
            )
        )
        existing.add(keyword_text)
        created += 1

    await db.commit()
    return {"created": created, "skipped": skipped}


@router.get("/projects/{project_id}/sov-trend")
async def get_sov_trend(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, float | str]]:
    project = await _load_project(db, project_id)
    return _build_monthly_sov(project)


@router.get("/projects/{project_id}/crawler-events")
async def list_crawler_events(
    project_id: uuid.UUID,
    operator: str | None = None,
    risk: Literal["low", "medium", "high", "review"] | None = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    await _ensure_project_exists(db, project_id)
    query = (
        select(CrawlerEvent)
        .where(CrawlerEvent.project_id == project_id)
        .order_by(CrawlerEvent.observed_at.desc())
    )
    if operator:
        query = query.where(CrawlerEvent.operator == operator)
    if risk:
        query = query.where(CrawlerEvent.risk_level == risk)
    query = query.limit(max(1, min(limit, 500)))

    result = await db.execute(query)
    return [_serialize_crawler_event(event) for event in result.scalars().all()]


@router.post("/projects/{project_id}/crawler-events")
async def create_crawler_event(
    project_id: uuid.UUID,
    body: CrawlerEventCreate,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    await _ensure_project_exists(db, project_id)
    event = CrawlerEvent(project_id=project_id, **_model_dump(body, exclude_none=True))
    if event.observed_at is None:
        event.observed_at = datetime.now(UTC)
    db.add(event)
    await db.flush()
    await _record_audit_log(
        db,
        project_id=project_id,
        action="crawler_event.created",
        resource_type="crawler_event",
        resource_id=str(event.id),
        metadata={"crawler_name": event.crawler_name, "path": event.path},
    )
    await db.commit()
    await db.refresh(event)
    await hackii_realtime.broadcast(
        str(project_id),
        {"type": "crawler_event", "project_id": str(project_id), "event_id": str(event.id)},
    )
    return _serialize_crawler_event(event)


@router.get("/projects/{project_id}/crawler-events/export.csv")
async def export_crawler_events_csv(
    project_id: uuid.UUID,
    limit: int = 1000,
    db: AsyncSession = Depends(get_db),
) -> Response:
    events = await list_crawler_events(project_id=project_id, limit=limit, db=db)
    return _csv_response(
        filename="hackii_crawler_events.csv",
        fieldnames=[
            "id",
            "observed_at",
            "source",
            "operator",
            "crawler_name",
            "category",
            "host",
            "path",
            "path_pattern",
            "status_code",
            "request_count",
            "bytes_transferred",
            "verified",
            "robots_status",
            "policy_action",
            "risk_level",
            "referrer_host",
        ],
        rows=events,
    )


@router.get("/projects/{project_id}/ppc/rules")
async def list_ppc_price_rules(
    project_id: uuid.UUID,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    await _ensure_project_exists(db, project_id)
    query = (
        select(PPCPriceRule)
        .where(PPCPriceRule.project_id == project_id)
        .order_by(PPCPriceRule.priority.asc(), PPCPriceRule.created_at.desc())
    )
    if active_only:
        query = query.where(PPCPriceRule.is_active.is_(True))
    result = await db.execute(query)
    return [_serialize_ppc_price_rule(rule) for rule in result.scalars().all()]


@router.post("/projects/{project_id}/ppc/rules")
async def create_ppc_price_rule(
    project_id: uuid.UUID,
    body: PPCPriceRuleCreate,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    await _ensure_project_exists(db, project_id)
    rule = PPCPriceRule(project_id=project_id, **_model_dump(body))
    db.add(rule)
    await db.flush()
    await _record_audit_log(
        db,
        project_id=project_id,
        action="ppc_price_rule.created",
        resource_type="ppc_price_rule",
        resource_id=str(rule.id),
        metadata={"path_pattern": rule.path_pattern, "action": rule.action, "price_minor": rule.price_minor},
    )
    await db.commit()
    await db.refresh(rule)
    return _serialize_ppc_price_rule(rule)


@router.get("/projects/{project_id}/ppc/events")
async def list_ppc_events(
    project_id: uuid.UUID,
    decision: Literal["candidate", "charged", "rejected", "blocked", "allowed", "review"] | None = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    await _ensure_project_exists(db, project_id)
    query = (
        select(PPCEvent)
        .where(PPCEvent.project_id == project_id)
        .order_by(PPCEvent.observed_at.desc())
    )
    if decision:
        query = query.where(PPCEvent.decision == decision)
    query = query.limit(max(1, min(limit, 500)))
    result = await db.execute(query)
    return [_serialize_ppc_event(event) for event in result.scalars().all()]


@router.post("/projects/{project_id}/ppc/events")
async def create_ppc_event(
    project_id: uuid.UUID,
    body: PPCEventCreate,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    await _ensure_project_exists(db, project_id)
    event = PPCEvent(project_id=project_id, **_model_dump(body, exclude_none=True))
    if event.observed_at is None:
        event.observed_at = datetime.now(UTC)
    db.add(event)
    await db.flush()
    await _record_audit_log(
        db,
        project_id=project_id,
        action="ppc_event.created",
        resource_type="ppc_event",
        resource_id=str(event.id),
        metadata={"crawler_name": event.crawler_name, "decision": event.decision, "path": event.path},
    )
    await db.commit()
    await db.refresh(event)
    await hackii_realtime.broadcast(
        str(project_id),
        {"type": "ppc_event", "project_id": str(project_id), "event_id": str(event.id)},
    )
    return _serialize_ppc_event(event)


@router.post("/projects/{project_id}/ppc/dry-run")
async def dry_run_ppc_decision(
    project_id: uuid.UUID,
    body: PPCDryRunRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    await _ensure_project_exists(db, project_id)
    result = await db.execute(
        select(PPCPriceRule)
        .where(PPCPriceRule.project_id == project_id, PPCPriceRule.is_active.is_(True))
        .order_by(PPCPriceRule.priority.asc(), PPCPriceRule.created_at.desc())
    )
    rules = list(result.scalars().all())
    rule = _select_ppc_rule(
        rules,
        path=body.path,
        operator=body.operator,
        crawler_name=body.crawler_name,
        category=body.category,
    )
    return _evaluate_ppc_dry_run(rule, body)


@router.get("/projects/{project_id}/ppc/events/export.csv")
async def export_ppc_events_csv(
    project_id: uuid.UUID,
    limit: int = 1000,
    db: AsyncSession = Depends(get_db),
) -> Response:
    events = await list_ppc_events(project_id=project_id, limit=limit, db=db)
    return _csv_response(
        filename="hackii_ppc_events.csv",
        fieldnames=[
            "id",
            "observed_at",
            "crawler_name",
            "operator",
            "path",
            "status_code",
            "decision",
            "currency",
            "rule_price_minor",
            "crawler_exact_price_minor",
            "crawler_max_price_minor",
            "signature_status",
            "payment_header_signed",
            "charge_status",
            "charge_reference",
            "rejection_reason",
        ],
        rows=events,
    )


@router.post("/projects/{project_id}/integrations/cloudflare/sync")
async def sync_cloudflare_crawler_events(
    project_id: uuid.UUID,
    body: CloudflareSyncRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    await _ensure_project_exists(db, project_id)
    try:
        rows = await CloudflareAICrawlControlClient().fetch_crawler_events(
            zone_id=body.zone_id,
            start=body.start,
            end=body.end,
            limit=body.limit,
        )
    except CloudflareConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except CloudflareAPIError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    created = 0
    for row in rows:
        observed_at = _parse_datetime(row.pop("observed_at", None)) or datetime.now(UTC)
        event = CrawlerEvent(
            project_id=project_id,
            observed_at=observed_at,
            host=row.get("host") or "unknown",
            path=row.get("path") or "/",
            status_code=int(row.get("status_code") or 200),
            request_count=int(row.get("request_count") or 0),
            bytes_transferred=int(row.get("bytes_transferred") or 0),
            crawler_name=row.get("crawler_name") or "UnknownCrawler",
            **{
                key: value
                for key, value in row.items()
                if key
                in {
                    "source",
                    "path_pattern",
                    "method",
                    "detection_id",
                    "user_agent",
                    "operator",
                    "category",
                    "verified",
                    "ip_hash",
                    "asn",
                    "country",
                    "referrer_host",
                    "robots_status",
                    "policy_action",
                    "risk_level",
                    "raw_event",
                }
            },
        )
        db.add(event)
        created += 1
    await _record_audit_log(
        db,
        project_id=project_id,
        action="cloudflare_crawler_events.synced",
        resource_type="crawler_event",
        metadata={"zone_id": body.zone_id, "created": created},
    )
    await db.commit()
    return {"created": created}


@router.get("/projects/{project_id}/monthly-report")
async def get_monthly_report(
    project_id: uuid.UUID,
    month: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    project = await _load_project(db, project_id)
    start, end = _month_range(month)
    crawler_events_result = await db.execute(
        select(CrawlerEvent)
        .where(
            CrawlerEvent.project_id == project_id,
            CrawlerEvent.observed_at >= start,
            CrawlerEvent.observed_at < end,
        )
    )
    crawler_events = list(crawler_events_result.scalars().all())
    ppc_events_result = await db.execute(
        select(PPCEvent)
        .where(
            PPCEvent.project_id == project_id,
            PPCEvent.observed_at >= start,
            PPCEvent.observed_at < end,
        )
    )
    ppc_events = list(ppc_events_result.scalars().all())
    return _build_monthly_report(project, crawler_events, ppc_events, start)


@router.get("/projects/{project_id}/audit-logs")
async def list_audit_logs(
    project_id: uuid.UUID,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    await _ensure_project_exists(db, project_id)
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.project_id == project_id)
        .order_by(AuditLog.created_at.desc())
        .limit(max(1, min(limit, 500)))
    )
    return [_serialize_audit_log(log) for log in result.scalars().all()]


@router.get("/projects/{project_id}/jobs")
async def list_measurement_jobs(
    project_id: uuid.UUID,
    status: str | None = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    query = (
        select(MeasurementJob)
        .where(MeasurementJob.project_id == project_id)
        .order_by(MeasurementJob.requested_at.desc())
        .limit(max(1, min(limit, 200)))
    )
    if status:
        query = query.where(MeasurementJob.status == status)

    result = await db.execute(query)
    return [_serialize_measurement_job(job) for job in result.scalars().all()]


@router.post("/projects/{project_id}/crawl")
async def trigger_crawl(
    project_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    body: CrawlRequest | None = None,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    body = body or CrawlRequest()
    project = await _load_project(db, project_id)
    selected_keyword_ids = set(body.keyword_ids or [])
    keywords = [
        keyword
        for keyword in project.keywords
        if keyword.is_active and (not selected_keyword_ids or keyword.id in selected_keyword_ids)
    ]

    enqueued_by_engine: dict[str, int] = defaultdict(int)
    skipped_existing = 0
    task_ids: list[str] = []
    for engine in body.engines:
        for keyword in keywords:
            idempotency_key = _measurement_idempotency_key(
                project_id=project.id,
                keyword_id=keyword.id,
                engine=engine,
                snapshot_date=date.today(),
            )
            existing_job = await _find_measurement_job(db, idempotency_key)
            if existing_job is not None:
                skipped_existing += 1
                task_ids.append(str(existing_job.id))
                continue

            job = MeasurementJob(
                project_id=project.id,
                keyword_id=keyword.id,
                ai_engine=engine.value,
                status="queued",
                idempotency_key=idempotency_key,
            )
            db.add(job)
            await db.flush()
            task = await task_queue.enqueue(
                engine,
                {
                    "job_id": str(job.id),
                    "project_id": str(project.id),
                    "keyword_id": str(keyword.id),
                    "keyword": keyword.keyword,
                    "query_template": keyword.query_template,
                    "target_domain": project.target_domain,
                },
            )
            enqueued_by_engine[engine.value] += 1
            task_ids.append(task.id)

    await db.commit()

    if isinstance(task_queue, LocalEngineTaskQueue):
        background_tasks.add_task(_drain_local_queue_once)

    return {
        "status": "queued",
        "project_id": str(project.id),
        "enqueued": sum(enqueued_by_engine.values()),
        "skipped_existing": skipped_existing,
        "by_engine": dict(enqueued_by_engine),
        "task_ids": task_ids,
    }


@router.post("/workers/crawl")
async def crawl_worker(
    payload: CrawlWorkerPayload,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    try:
        return await _process_crawl_payload(payload, db)
    except PerplexityRateLimitError as exc:
        await _mark_measurement_job(
            db,
            payload.job_id,
            status="rate_limited",
            error_message=str(exc),
            completed=True,
        )
        await db.commit()
        await task_queue.handle_rate_limit(
            AIEngine.PERPLEXITY,
            retry_after_seconds=exc.retry_after_seconds,
        )
        raise HTTPException(
            status_code=429,
            detail=f"Perplexity rate limited. Retry after {exc.retry_after_seconds}s.",
        )
    except PerplexityConfigError as exc:
        await _mark_measurement_job(
            db,
            payload.job_id,
            status="failed",
            error_message=str(exc),
            completed=True,
        )
        await db.commit()
        raise HTTPException(status_code=503, detail=str(exc))
    except PerplexityAPIError as exc:
        await _mark_measurement_job(
            db,
            payload.job_id,
            status="failed",
            error_message=str(exc),
            completed=True,
        )
        await db.commit()
        raise HTTPException(status_code=502, detail=str(exc))


async def _process_crawl_payload(
    payload: CrawlWorkerPayload,
    db: AsyncSession,
) -> dict[str, Any]:
    project = await _load_project(db, payload.project_id)
    keyword = next((item for item in project.keywords if item.id == payload.keyword_id), None)
    if keyword is None:
        raise HTTPException(status_code=404, detail="Keyword not found")

    await _mark_measurement_job(db, payload.job_id, status="running", started=True)

    raw_response = payload.raw_response
    answer_text = payload.answer_text

    if raw_response is None:
        if payload.engine != AIEngine.PERPLEXITY:
            message = "External API call is not implemented for this engine yet."
            await _mark_measurement_job(
                db,
                payload.job_id,
                status="failed",
                error_message=message,
                completed=True,
            )
            await db.commit()
            return {
                "status": "accepted",
                "engine": payload.engine.value,
                "note": message,
            }

        response = await PerplexityClient().ask(
            prompt=build_prompt(
                payload.keyword or keyword.keyword,
                payload.query_template or keyword.query_template,
            )
        )
        raw_response = response.raw_response
        raw_citations = response.citations
        answer_text = response.answer_text
    elif isinstance(raw_response, dict):
        raw_citations = raw_response.get("citations")
    else:
        raw_citations = raw_response

    parsed = parse_citations(
        raw_citations,
        target_domain=project.target_domain,
        competitor_domains=[competitor.domain for competitor in project.competitors],
    )
    if answer_text is None and isinstance(raw_response, dict):
        answer_text = (
            raw_response.get("answer")
            or raw_response.get("text")
            or _extract_openai_compatible_answer(raw_response)
        )

    result = CitationResult(
        keyword_id=keyword.id,
        ai_engine=payload.engine.value,
        snapshot_date=date.today(),
        queried_at=datetime.now(UTC),
        answer_text=answer_text,
        citations_raw=raw_citations or [],
        is_cited=parsed.is_cited,
        cited_url=parsed.cited_url,
        cited_position=parsed.cited_position,
    )
    db.add(result)
    await _mark_measurement_job(db, payload.job_id, status="succeeded", completed=True)
    await db.commit()
    await db.refresh(result)

    await hackii_realtime.broadcast(
        str(project.id),
        {
            "type": "crawl_result",
            "project_id": str(project.id),
            "keyword_id": str(keyword.id),
            "engine": result.ai_engine,
            "is_cited": result.is_cited,
            "cited_url": result.cited_url,
            "cited_position": result.cited_position,
        },
    )

    return {
        "status": "saved",
        "result_id": str(result.id),
        "is_cited": result.is_cited,
        "cited_url": result.cited_url,
        "cited_position": result.cited_position,
    }


async def _drain_local_queue_once() -> None:
    if not isinstance(task_queue, LocalEngineTaskQueue):
        return

    session_factory = get_sessionmaker()

    async def handle_task(task: EngineTask) -> None:
        payload = CrawlWorkerPayload(engine=task.engine, **task.payload)
        async with session_factory() as db:
            try:
                await _process_crawl_payload(payload, db)
            except PerplexityRateLimitError as exc:
                raise EngineRateLimitError(task.engine, exc.retry_after_seconds) from exc

    try:
        await task_queue.drain_ready(handle_task)
    except Exception:
        pass


async def _load_projects(db: AsyncSession) -> list[Project]:
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.competitors),
            selectinload(Project.keywords).selectinload(Keyword.citation_results),
        )
        .order_by(Project.created_at)
    )
    return list(result.scalars().unique().all())


async def _load_project(db: AsyncSession, project_id: uuid.UUID) -> Project:
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.competitors),
            selectinload(Project.keywords).selectinload(Keyword.citation_results),
        )
    )
    project = result.scalars().unique().one_or_none()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _serialize_project(project: Project) -> dict[str, Any]:
    current_sov = _build_current_sov(project)
    monthly_sov = _build_monthly_sov(project)
    keywords = [_serialize_keyword(project, keyword) for keyword in project.keywords]
    cited_count = sum(1 for keyword in keywords if keyword["perplexity"])
    tracked_count = len(keywords)
    latest_month = monthly_sov[-1] if monthly_sov else {"self": 0.0}
    previous_month = monthly_sov[-2] if len(monthly_sov) >= 2 else {"self": 0.0}
    self_sov = float(latest_month.get("self", current_sov["self"]))
    previous_self_sov = float(previous_month.get("self", 0.0))

    return {
        "id": str(project.id),
        "name": project.name,
        "targetDomain": project.target_domain,
        "competitors": [competitor.domain for competitor in project.competitors],
        "stats": {
            "trackedCount": tracked_count,
            "avgSOV": round(self_sov, 1),
            "citedCount": cited_count,
            "notCitedCount": max(0, tracked_count - cited_count),
            "sovTrendChange": round(self_sov - previous_self_sov, 1),
        },
        "monthlySOV": monthly_sov,
        "competitorSOV": _build_competitor_sov(project, current_sov),
        "keywords": keywords,
    }


def _serialize_measurement_job(job: MeasurementJob) -> dict[str, Any]:
    return {
        "id": str(job.id),
        "project_id": str(job.project_id),
        "keyword_id": str(job.keyword_id) if job.keyword_id else None,
        "ai_engine": job.ai_engine,
        "status": job.status,
        "idempotency_key": job.idempotency_key,
        "requested_at": job.requested_at.isoformat() if job.requested_at else None,
        "started_at": job.started_at.isoformat() if job.started_at else None,
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        "retry_count": job.retry_count,
        "error_message": job.error_message,
    }


def _serialize_crawler_event(event: CrawlerEvent) -> dict[str, Any]:
    return {
        "id": str(event.id),
        "project_id": str(event.project_id),
        "observed_at": event.observed_at.isoformat() if event.observed_at else None,
        "source": event.source,
        "host": event.host,
        "path": event.path,
        "path_pattern": event.path_pattern,
        "method": event.method,
        "status_code": event.status_code,
        "request_count": event.request_count,
        "bytes_transferred": event.bytes_transferred,
        "detection_id": event.detection_id,
        "user_agent": event.user_agent,
        "crawler_name": event.crawler_name,
        "operator": event.operator,
        "category": event.category,
        "verified": event.verified,
        "ip_hash": event.ip_hash,
        "asn": event.asn,
        "country": event.country,
        "referrer_host": event.referrer_host,
        "robots_status": event.robots_status,
        "policy_action": event.policy_action,
        "risk_level": event.risk_level,
        "raw_event": event.raw_event,
        "created_at": event.created_at.isoformat() if event.created_at else None,
    }


def _serialize_ppc_price_rule(rule: PPCPriceRule) -> dict[str, Any]:
    return {
        "id": str(rule.id),
        "project_id": str(rule.project_id),
        "path_pattern": rule.path_pattern,
        "operator": rule.operator,
        "crawler_name": rule.crawler_name,
        "category": rule.category,
        "action": rule.action,
        "currency": rule.currency,
        "price_minor": rule.price_minor,
        "priority": rule.priority,
        "is_active": rule.is_active,
        "reason": rule.reason,
        "created_at": rule.created_at.isoformat() if rule.created_at else None,
        "updated_at": rule.updated_at.isoformat() if rule.updated_at else None,
    }


def _serialize_ppc_event(event: PPCEvent) -> dict[str, Any]:
    return {
        "id": str(event.id),
        "project_id": str(event.project_id),
        "crawler_event_id": str(event.crawler_event_id) if event.crawler_event_id else None,
        "price_rule_id": str(event.price_rule_id) if event.price_rule_id else None,
        "observed_at": event.observed_at.isoformat() if event.observed_at else None,
        "crawler_name": event.crawler_name,
        "operator": event.operator,
        "path": event.path,
        "status_code": event.status_code,
        "decision": event.decision,
        "currency": event.currency,
        "rule_price_minor": event.rule_price_minor,
        "crawler_exact_price_minor": event.crawler_exact_price_minor,
        "crawler_max_price_minor": event.crawler_max_price_minor,
        "signature_status": event.signature_status,
        "payment_header_signed": event.payment_header_signed,
        "charge_status": event.charge_status,
        "charge_reference": event.charge_reference,
        "rejection_reason": event.rejection_reason,
        "raw_event": event.raw_event,
        "created_at": event.created_at.isoformat() if event.created_at else None,
    }


def _serialize_audit_log(log: AuditLog) -> dict[str, Any]:
    return {
        "id": str(log.id),
        "project_id": str(log.project_id) if log.project_id else None,
        "actor_type": log.actor_type,
        "actor_id": log.actor_id,
        "action": log.action,
        "resource_type": log.resource_type,
        "resource_id": log.resource_id,
        "metadata": log.metadata_json,
        "ip_hash": log.ip_hash,
        "created_at": log.created_at.isoformat() if log.created_at else None,
    }


def _serialize_keyword(project: Project, keyword: Keyword) -> dict[str, Any]:
    latest_by_engine = _latest_results_by_engine(keyword)
    perplexity_result = latest_by_engine.get(AIEngine.PERPLEXITY.value)
    gemini_result = latest_by_engine.get(AIEngine.GEMINI.value)
    openai_result = latest_by_engine.get(AIEngine.OPENAI.value)
    primary_result = latest_by_engine.get(AIEngine.PERPLEXITY.value) or _latest_result(keyword)
    citations = extract_citation_urls(primary_result.citations_raw if primary_result else [])
    parsed = parse_citations(
        citations,
        target_domain=project.target_domain,
        competitor_domains=[competitor.domain for competitor in project.competitors],
    )
    total_slots = len(parsed.citations)
    own_sov = (len(parsed.own_hits) / total_slots * 100) if total_slots else 0.0

    return {
        "keyword": keyword.keyword,
        "vol": keyword.search_volume,
        "perplexity": bool(perplexity_result.is_cited) if perplexity_result else False,
        "gemini": bool(gemini_result.is_cited) if gemini_result else False,
        "gpt4": bool(openai_result.is_cited) if openai_result else False,
        "claude": False,
        "sov": round(own_sov, 1),
        "answer_text": primary_result.answer_text if primary_result else "",
        "cited_url": primary_result.cited_url if primary_result else "",
        "cited_position": primary_result.cited_position if primary_result else 0,
        "citations": parsed.citations,
    }


def _latest_results_by_engine(keyword: Keyword) -> dict[str, CitationResult]:
    results: dict[str, CitationResult] = {}
    for result in sorted(keyword.citation_results, key=lambda item: item.queried_at, reverse=True):
        results.setdefault(result.ai_engine, result)
    return results


def _latest_result(keyword: Keyword) -> CitationResult | None:
    if not keyword.citation_results:
        return None
    return max(keyword.citation_results, key=lambda item: item.queried_at)


def _build_current_sov(project: Project) -> dict[str, float]:
    latest_results = [
        latest
        for keyword in project.keywords
        if (latest := _latest_result(keyword)) is not None
    ]
    return _calculate_sov(project, latest_results)


def _build_monthly_sov(project: Project) -> list[dict[str, float | str]]:
    results_by_month: dict[tuple[int, int], list[CitationResult]] = defaultdict(list)
    for keyword in project.keywords:
        for result in keyword.citation_results:
            results_by_month[(result.snapshot_date.year, result.snapshot_date.month)].append(result)

    months = _last_six_months(date.today())
    rows: list[dict[str, float | str]] = []
    for year, month in months:
        sov = _calculate_sov(project, results_by_month.get((year, month), []))
        rows.append(
            {
                "month": f"{month}月",
                "self": sov["self"],
                "compA": sov["competitors"][0] if len(sov["competitors"]) > 0 else 0.0,
                "compB": sov["competitors"][1] if len(sov["competitors"]) > 1 else 0.0,
                "compC": sov["competitors"][2] if len(sov["competitors"]) > 2 else 0.0,
            }
        )
    return rows


def _build_competitor_sov(project: Project, sov: dict[str, Any]) -> list[dict[str, Any]]:
    rows = [
        {
            "name": f"自社 ({project.target_domain})",
            "value": sov["self"],
            "color": SOV_COLORS[0],
        }
    ]
    for index, competitor in enumerate(project.competitors, start=1):
        values = sov["competitors"]
        rows.append(
            {
                "name": f"競合{index} ({competitor.domain})",
                "value": values[index - 1] if len(values) >= index else 0.0,
                "color": SOV_COLORS[index % len(SOV_COLORS)],
            }
        )
    return rows


def _calculate_sov(project: Project, results: list[CitationResult]) -> dict[str, Any]:
    target_hits = 0
    competitor_hits = [0 for _ in project.competitors]
    total_slots = 0

    for result in results:
        citations = extract_citation_urls(result.citations_raw)
        total_slots += len(citations)
        for citation in citations:
            if domain_matches_url(citation, project.target_domain):
                target_hits += 1
            for index, competitor in enumerate(project.competitors):
                if domain_matches_url(citation, competitor.domain):
                    competitor_hits[index] += 1

    if total_slots == 0:
        return {
            "self": 0.0,
            "competitors": [0.0 for _ in project.competitors],
        }

    return {
        "self": round(target_hits / total_slots * 100, 1),
        "competitors": [round(hit_count / total_slots * 100, 1) for hit_count in competitor_hits],
    }


def _last_six_months(today: date) -> list[tuple[int, int]]:
    months: list[tuple[int, int]] = []
    year = today.year
    month = today.month
    for _ in range(6):
        months.append((year, month))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    return list(reversed(months))


def _parse_keyword_csv(csv_text: str) -> list[KeywordCreate]:
    sample = csv_text.strip()
    if not sample:
        return []

    reader = csv.DictReader(StringIO(sample))
    if reader.fieldnames and "keyword" in {field.strip() for field in reader.fieldnames if field}:
        rows = []
        for row in reader:
            normalized = {str(key).strip(): value for key, value in row.items() if key}
            rows.append(
                KeywordCreate(
                    keyword=normalized.get("keyword", "").strip(),
                    search_volume=_safe_int(
                        normalized.get("search_volume")
                        or normalized.get("volume")
                        or normalized.get("vol")
                    ),
                    query_template=normalized.get("query_template") or None,
                )
            )
        return rows

    rows = []
    for row in csv.reader(StringIO(sample)):
        if not row or not row[0].strip():
            continue
        rows.append(
            KeywordCreate(
                keyword=row[0].strip(),
                search_volume=_safe_int(row[1] if len(row) > 1 else None),
            )
        )
    return rows


def _normalize_input_domain(domain: str) -> str:
    return domain.strip().lower().removeprefix("https://").removeprefix("http://").split("/", 1)[0]


def _safe_int(value: Any) -> int:
    try:
        return max(0, int(str(value or "0").replace(",", "").strip()))
    except ValueError:
        return 0


def _measurement_idempotency_key(
    *,
    project_id: uuid.UUID,
    keyword_id: uuid.UUID,
    engine: AIEngine,
    snapshot_date: date,
) -> str:
    return f"{project_id}:{keyword_id}:{engine.value}:{snapshot_date.isoformat()}"


async def _find_measurement_job(
    db: AsyncSession,
    idempotency_key: str,
) -> MeasurementJob | None:
    result = await db.execute(
        select(MeasurementJob).where(MeasurementJob.idempotency_key == idempotency_key)
    )
    return result.scalar_one_or_none()


async def _mark_measurement_job(
    db: AsyncSession,
    job_id: uuid.UUID | None,
    *,
    status: str,
    error_message: str | None = None,
    started: bool = False,
    completed: bool = False,
) -> None:
    if job_id is None:
        return

    job = await db.get(MeasurementJob, job_id)
    if job is None:
        return

    now = datetime.now(UTC)
    job.status = status
    if started and job.started_at is None:
        job.started_at = now
    if completed:
        job.completed_at = now
    if error_message:
        job.error_message = error_message[:4000]


async def _ensure_project_exists(db: AsyncSession, project_id: uuid.UUID) -> None:
    project = await db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")


async def _record_audit_log(
    db: AsyncSession,
    *,
    action: str,
    resource_type: str,
    project_id: uuid.UUID | None = None,
    resource_id: str | None = None,
    actor_type: str = "system",
    actor_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    db.add(
        AuditLog(
            project_id=project_id,
            actor_type=actor_type,
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=metadata or {},
        )
    )


def _csv_response(
    *,
    filename: str,
    fieldnames: list[str],
    rows: list[dict[str, Any]],
) -> Response:
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return Response(
        content=output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _month_range(month: str | None) -> tuple[datetime, datetime]:
    if month:
        try:
            year, month_number = [int(part) for part in month.split("-", 1)]
            start = datetime(year, month_number, 1, tzinfo=UTC)
        except ValueError:
            raise HTTPException(status_code=400, detail="month must be YYYY-MM")
    else:
        today = date.today()
        start = datetime(today.year, today.month, 1, tzinfo=UTC)

    if start.month == 12:
        end = datetime(start.year + 1, 1, 1, tzinfo=UTC)
    else:
        end = datetime(start.year, start.month + 1, 1, tzinfo=UTC)
    return start, end


def _build_monthly_report(
    project: Project,
    crawler_events: list[CrawlerEvent],
    ppc_events: list[PPCEvent],
    report_month: datetime,
) -> dict[str, Any]:
    total_crawler_requests = sum(event.request_count for event in crawler_events)
    verified_requests = sum(event.request_count for event in crawler_events if event.verified)
    blocked_or_charged = sum(
        event.request_count
        for event in crawler_events
        if event.policy_action in {"block", "charge"} or event.status_code in {402, 403}
    )
    high_risk_events = sum(1 for event in crawler_events if event.risk_level == "high")
    candidate_gmv_minor = sum(
        event.rule_price_minor or 0
        for event in ppc_events
        if event.decision in {"candidate", "charged"} and event.charge_status != "failed"
    )
    rejected_value_minor = sum(
        event.rule_price_minor or 0
        for event in ppc_events
        if event.decision in {"rejected", "blocked"}
    )
    recorded_value_minor = sum(
        event.rule_price_minor or 0
        for event in ppc_events
        if event.charge_status in {"recorded", "reconciled", "payout_pending", "paid"}
    )

    return {
        "project_id": str(project.id),
        "project_name": project.name,
        "target_domain": project.target_domain,
        "report_month": report_month.strftime("%Y-%m"),
        "hackii": {
            "tracked_keywords": len(project.keywords),
            "current_sov": _build_current_sov(project),
            "monthly_sov": _build_monthly_sov(project),
            "competitor_sov": _build_competitor_sov(project, _build_current_sov(project)),
        },
        "ai_crawler_detection": {
            "events": len(crawler_events),
            "requests": total_crawler_requests,
            "verified_rate": round(verified_requests / total_crawler_requests * 100, 1)
            if total_crawler_requests
            else 0.0,
            "blocked_or_charged_requests": blocked_or_charged,
            "bytes_transferred": sum(event.bytes_transferred for event in crawler_events),
            "high_risk_events": high_risk_events,
            "top_operators": _top_counts(crawler_events, "operator"),
            "top_paths": _top_counts(crawler_events, "path_pattern"),
        },
        "ppc": {
            "events": len(ppc_events),
            "candidate_events": sum(1 for event in ppc_events if event.decision == "candidate"),
            "charged_events": sum(1 for event in ppc_events if event.decision == "charged"),
            "blocked_or_rejected_events": sum(
                1 for event in ppc_events if event.decision in {"blocked", "rejected"}
            ),
            "candidate_gmv_minor": candidate_gmv_minor,
            "recorded_value_minor": recorded_value_minor,
            "rejected_value_minor": rejected_value_minor,
            "currency": next((event.currency for event in ppc_events if event.currency), "JPY"),
            "positioning": "PPC is treated as a charge-candidate ledger until legal, tax, and settlement review is complete.",
        },
    }


def _top_counts(items: list[Any], field: str, limit: int = 5) -> list[dict[str, Any]]:
    counts: dict[str, int] = defaultdict(int)
    for item in items:
        value = getattr(item, field, None) or "unknown"
        count_value = getattr(item, "request_count", 1)
        counts[str(value)] += int(count_value or 0)
    return [
        {"name": name, "count": count}
        for name, count in sorted(counts.items(), key=lambda pair: pair[1], reverse=True)[:limit]
    ]


def _select_ppc_rule(
    rules: list[PPCPriceRule],
    *,
    path: str,
    operator: str | None,
    crawler_name: str | None,
    category: str | None,
) -> PPCPriceRule | None:
    for rule in sorted(rules, key=lambda item: (item.priority, str(item.id or ""))):
        if not fnmatch.fnmatch(path, rule.path_pattern):
            continue
        if rule.operator and not _same_optional_value(rule.operator, operator):
            continue
        if rule.crawler_name and not _same_optional_value(rule.crawler_name, crawler_name):
            continue
        if rule.category and not _same_optional_value(rule.category, category):
            continue
        return rule
    return None


def _evaluate_ppc_dry_run(rule: PPCPriceRule | None, body: PPCDryRunRequest) -> dict[str, Any]:
    if rule is None:
        return {
            "decision": "review",
            "status_code": 202,
            "reason": "no matching price rule",
            "charge_status": "not_attempted",
            "rule": None,
            "settlement_owner": "external",
            "production_note": "No payment should be attempted without an explicit price rule.",
        }

    base = {
        "rule": _serialize_ppc_price_rule(rule),
        "currency": rule.currency,
        "rule_price_minor": rule.price_minor,
        "settlement_owner": "external",
    }
    if rule.action == "allow":
        return {
            **base,
            "decision": "allowed",
            "status_code": 200,
            "reason": "rule allows this crawler/path",
            "charge_status": "not_attempted",
        }
    if rule.action == "block":
        return {
            **base,
            "decision": "blocked",
            "status_code": 403,
            "reason": "rule blocks this crawler/path",
            "charge_status": "not_attempted",
        }
    if rule.action == "review":
        return {
            **base,
            "decision": "review",
            "status_code": 202,
            "reason": "rule requires manual review",
            "charge_status": "not_attempted",
        }

    if not body.verified:
        return {
            **base,
            "decision": "blocked",
            "status_code": 403,
            "reason": "unverified crawler is not chargeable",
            "charge_status": "not_attempted",
        }

    max_price = body.crawler_max_price_minor
    exact_price = body.crawler_exact_price_minor
    offered_price = max(value for value in [max_price or 0, exact_price or 0])
    if offered_price and offered_price < rule.price_minor:
        return {
            **base,
            "decision": "rejected",
            "status_code": 402,
            "reason": "crawler price is below rule price",
            "charge_status": "not_attempted",
            "crawler_offer_minor": offered_price,
        }

    if body.signature_status == "valid" and body.payment_header_signed and offered_price >= rule.price_minor:
        return {
            **base,
            "decision": "candidate",
            "status_code": 402,
            "reason": "valid payment intent detected; external settlement review required",
            "charge_status": "not_attempted",
            "crawler_offer_minor": offered_price,
        }

    return {
        **base,
        "decision": "candidate",
        "status_code": 402,
        "reason": "payment required; signed payment intent is missing or incomplete",
        "charge_status": "not_attempted",
        "crawler_offer_minor": offered_price,
    }


def _same_optional_value(left: str | None, right: str | None) -> bool:
    return (left or "").casefold() == (right or "").casefold()


def _parse_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def _model_dump(model: BaseModel, **kwargs: Any) -> dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump(**kwargs)
    return model.dict(**kwargs)


def _extract_openai_compatible_answer(raw_response: dict[str, Any]) -> str:
    choices = raw_response.get("choices") or []
    if not choices:
        return ""
    message = choices[0].get("message") or {}
    return str(message.get("content") or "")
