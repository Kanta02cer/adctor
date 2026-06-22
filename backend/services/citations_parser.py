from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse

URL_FIELDS = ("url", "source_url", "link", "href", "citation_url")


@dataclass(frozen=True)
class CitationHit:
    domain: str
    url: str
    position: int


@dataclass(frozen=True)
class CitationParseResult:
    citations: list[str]
    is_cited: bool
    cited_url: str | None
    cited_position: int | None
    own_hits: list[CitationHit]
    competitor_hits: list[CitationHit]


def extract_citation_urls(raw: Any) -> list[str]:
    if raw is None:
        return []

    if isinstance(raw, dict):
        if "citations" in raw:
            raw = raw["citations"]
        elif "search_results" in raw:
            raw = raw["search_results"]
        else:
            raw = [raw]

    if isinstance(raw, str):
        return [raw.strip()] if raw.strip() else []

    if not isinstance(raw, (list, tuple)):
        return []

    urls: list[str] = []
    for item in raw:
        if isinstance(item, str):
            if item.strip():
                urls.append(item.strip())
            continue

        if not isinstance(item, dict):
            continue

        url = _first_url_value(item)
        if url:
            urls.append(url)

    return urls


def parse_citations(
    raw_citations: Any,
    *,
    target_domain: str,
    competitor_domains: list[str] | tuple[str, ...] = (),
) -> CitationParseResult:
    citations = extract_citation_urls(raw_citations)
    normalized_target = normalize_domain(target_domain)
    normalized_competitors = [
        domain for domain in (normalize_domain(domain) for domain in competitor_domains) if domain
    ]

    own_hits: list[CitationHit] = []
    competitor_hits: list[CitationHit] = []

    for position, url in enumerate(citations, start=1):
        if normalized_target and domain_matches_url(url, normalized_target):
            own_hits.append(CitationHit(domain=normalized_target, url=url, position=position))

        for competitor_domain in normalized_competitors:
            if domain_matches_url(url, competitor_domain):
                competitor_hits.append(
                    CitationHit(domain=competitor_domain, url=url, position=position)
                )

    first_own_hit = own_hits[0] if own_hits else None
    return CitationParseResult(
        citations=citations,
        is_cited=first_own_hit is not None,
        cited_url=first_own_hit.url if first_own_hit else None,
        cited_position=first_own_hit.position if first_own_hit else None,
        own_hits=own_hits,
        competitor_hits=competitor_hits,
    )


def domain_matches_url(url: str, domain: str) -> bool:
    normalized_domain = normalize_domain(domain)
    hostname = hostname_from_url(url)
    if not hostname or not normalized_domain:
        return False
    return hostname == normalized_domain or hostname.endswith(f".{normalized_domain}")


def normalize_domain(domain: str) -> str:
    value = str(domain or "").strip().lower()
    if not value:
        return ""

    parsed = urlparse(value if "://" in value else f"//{value}")
    hostname = parsed.hostname or value.split("/", 1)[0].split(":", 1)[0]
    hostname = hostname.strip().rstrip(".").lower()
    if hostname.startswith("www."):
        hostname = hostname[4:]
    return hostname


def hostname_from_url(url: str) -> str:
    value = str(url or "").strip()
    if not value:
        return ""

    parsed = urlparse(value if "://" in value else f"//{value}")
    hostname = parsed.hostname or ""
    hostname = hostname.strip().rstrip(".").lower()
    if hostname.startswith("www."):
        hostname = hostname[4:]
    return hostname


def _first_url_value(item: dict[str, Any]) -> str | None:
    for field in URL_FIELDS:
        value = item.get(field)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None
