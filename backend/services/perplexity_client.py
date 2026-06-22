from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

import httpx


class PerplexityAPIError(Exception):
    pass


class PerplexityConfigError(PerplexityAPIError):
    pass


class PerplexityRateLimitError(PerplexityAPIError):
    def __init__(self, retry_after_seconds: int = 60) -> None:
        self.retry_after_seconds = retry_after_seconds
        super().__init__("Perplexity API rate limit exceeded")


@dataclass(frozen=True)
class PerplexityResponse:
    answer_text: str
    citations: list[str]
    raw_response: dict[str, Any]


@dataclass(frozen=True)
class PerplexityConfig:
    api_key: str
    model: str = "sonar-pro"
    base_url: str = "https://api.perplexity.ai"
    timeout_seconds: float = 30.0

    @classmethod
    def from_env(cls) -> "PerplexityConfig":
        api_key = os.getenv("PERPLEXITY_API_KEY", "").strip()
        if not api_key:
            raise PerplexityConfigError("PERPLEXITY_API_KEY is not configured")
        return cls(
            api_key=api_key,
            model=os.getenv("PERPLEXITY_MODEL", "sonar-pro").strip() or "sonar-pro",
            base_url=os.getenv("PERPLEXITY_BASE_URL", "https://api.perplexity.ai").rstrip("/"),
            timeout_seconds=float(os.getenv("PERPLEXITY_TIMEOUT_SECONDS", "30")),
        )


class PerplexityClient:
    def __init__(self, config: PerplexityConfig | None = None) -> None:
        self.config = config or PerplexityConfig.from_env()

    async def ask(self, *, prompt: str) -> PerplexityResponse:
        async with httpx.AsyncClient(timeout=self.config.timeout_seconds) as client:
            response = await client.post(
                f"{self.config.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.config.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.config.model,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )

        if response.status_code == 429:
            raise PerplexityRateLimitError(_retry_after_seconds(response))

        if response.status_code >= 400:
            raise PerplexityAPIError(f"Perplexity API failed with HTTP {response.status_code}")

        data = response.json()
        return PerplexityResponse(
            answer_text=_extract_answer_text(data),
            citations=[str(url) for url in data.get("citations", []) if str(url).strip()],
            raw_response=data,
        )


def build_prompt(keyword: str, query_template: str | None = None) -> str:
    template = query_template or "{keyword}について、信頼できる出典URL付きで詳しく教えてください。"
    return template.replace("{keyword}", keyword)


def _extract_answer_text(data: dict[str, Any]) -> str:
    choices = data.get("choices") or []
    if not choices:
        return ""

    message = choices[0].get("message") or {}
    content = message.get("content")
    return str(content or "")


def _retry_after_seconds(response: httpx.Response) -> int:
    value = response.headers.get("retry-after")
    if not value:
        return 60
    try:
        return max(1, int(float(value)))
    except ValueError:
        return 60
