from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime
from typing import Any

import httpx


class CloudflareConfigError(RuntimeError):
    pass


class CloudflareAPIError(RuntimeError):
    pass


@dataclass(frozen=True)
class CloudflareCrawlControlConfig:
    api_token: str
    endpoint: str = "https://api.cloudflare.com/client/v4/graphql"
    timeout_seconds: float = 30.0

    @classmethod
    def from_env(cls) -> "CloudflareCrawlControlConfig":
        api_token = os.getenv("CLOUDFLARE_API_TOKEN", "").strip()
        if not api_token:
            raise CloudflareConfigError("CLOUDFLARE_API_TOKEN is not configured")
        return cls(
            api_token=api_token,
            endpoint=os.getenv("CLOUDFLARE_GRAPHQL_ENDPOINT", "https://api.cloudflare.com/client/v4/graphql"),
            timeout_seconds=float(os.getenv("CLOUDFLARE_TIMEOUT_SECONDS", "30")),
        )


class CloudflareAICrawlControlClient:
    def __init__(self, config: CloudflareCrawlControlConfig | None = None) -> None:
        self.config = config or CloudflareCrawlControlConfig.from_env()

    async def fetch_crawler_events(
        self,
        *,
        zone_id: str,
        start: datetime,
        end: datetime,
        limit: int = 5000,
    ) -> list[dict[str, Any]]:
        payload = {
            "query": _AI_CRAWLER_EVENTS_QUERY,
            "variables": {
                "zoneTag": zone_id,
                "start": start.isoformat().replace("+00:00", "Z"),
                "end": end.isoformat().replace("+00:00", "Z"),
                "limit": max(1, min(limit, 5000)),
            },
        }
        response = await self._post_graphql(payload)
        groups = (
            response.get("data", {})
            .get("viewer", {})
            .get("zones", [{}])[0]
            .get("httpRequestsAdaptiveGroups", [])
        )
        return [self._map_group(group) for group in groups]

    async def _post_graphql(self, payload: dict[str, Any]) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.config.timeout_seconds) as client:
            response = await client.post(
                self.config.endpoint,
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.config.api_token}",
                    "Content-Type": "application/json",
                },
            )
        if response.status_code >= 400:
            raise CloudflareAPIError(f"Cloudflare GraphQL API failed: {response.status_code}")
        data = response.json()
        if data.get("errors"):
            raise CloudflareAPIError(str(data["errors"]))
        return data

    def _map_group(self, group: dict[str, Any]) -> dict[str, Any]:
        dimensions = group.get("dimensions") or {}
        sums = group.get("sum") or {}
        detection_ids = dimensions.get("botDetectionIds") or []
        return {
            "source": "cloudflare_graphql",
            "observed_at": dimensions.get("datetimeHour"),
            "host": dimensions.get("clientRequestHTTPHost") or "",
            "path": dimensions.get("clientRequestPath") or "/",
            "path_pattern": dimensions.get("clientRequestPath") or "/",
            "status_code": dimensions.get("edgeResponseStatus") or 200,
            "request_count": group.get("count") or 0,
            "bytes_transferred": sums.get("edgeResponseBytes") or 0,
            "detection_id": ",".join(str(item) for item in detection_ids),
            "user_agent": dimensions.get("userAgent"),
            "crawler_name": _crawler_name(dimensions.get("userAgent"), detection_ids),
            "operator": _operator_from_user_agent(dimensions.get("userAgent")),
            "category": "Unknown",
            "verified": bool(detection_ids),
            "referrer_host": dimensions.get("clientRefererHost"),
            "robots_status": "unknown",
            "policy_action": "monitor",
            "risk_level": "review",
            "raw_event": group,
        }


def _crawler_name(user_agent: str | None, detection_ids: list[Any]) -> str:
    if user_agent:
        return user_agent.split("/", 1)[0][:255]
    if detection_ids:
        return f"CloudflareDetection:{detection_ids[0]}"
    return "UnknownCrawler"


def _operator_from_user_agent(user_agent: str | None) -> str | None:
    if not user_agent:
        return None
    value = user_agent.lower()
    if "gptbot" in value or "chatgpt" in value or "oai-searchbot" in value:
        return "OpenAI"
    if "claude" in value or "anthropic" in value:
        return "Anthropic"
    if "perplexity" in value:
        return "Perplexity"
    if "google" in value or "gemini" in value:
        return "Google"
    if "bytespider" in value or "bytedance" in value:
        return "ByteDance"
    if "meta" in value:
        return "Meta"
    return None


_AI_CRAWLER_EVENTS_QUERY = """
query AICrawlerEvents($zoneTag: string, $start: Time, $end: Time, $limit: uint64) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequestsAdaptiveGroups(
        filter: {
          datetime_geq: $start
          datetime_leq: $end
          requestSource: "eyeball"
        }
        limit: $limit
        orderBy: [count_DESC]
      ) {
        count
        dimensions {
          datetimeHour
          clientRequestHTTPHost
          clientRequestPath
          clientRefererHost
          edgeResponseStatus
          userAgent
          botDetectionIds
        }
        sum {
          edgeResponseBytes
        }
      }
    }
  }
}
"""
