import uuid
from datetime import date, datetime
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

try:
    from .database import Base
except ImportError:
    from database import Base


class Account(Base):
    __tablename__ = "accounts"
    __table_args__ = (
        CheckConstraint(
            "plan in ('free', 'standard', 'agency', 'enterprise')",
            name="account_plan_allowed",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    plan: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="free",
        server_default="free",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    projects: Mapped[list["Project"]] = relationship(
        back_populates="account",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (
        UniqueConstraint(
            "account_id",
            "target_domain",
            name="uq_projects_account_target_domain",
        ),
        Index("ix_projects_account_id", "account_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("accounts.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    target_domain: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    account: Mapped["Account"] = relationship(back_populates="projects")
    competitors: Mapped[list["Competitor"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    keywords: Mapped[list["Keyword"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    measurement_jobs: Mapped[list["MeasurementJob"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    crawler_events: Mapped[list["CrawlerEvent"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    ppc_price_rules: Mapped[list["PPCPriceRule"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    ppc_events: Mapped[list["PPCEvent"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Competitor(Base):
    __tablename__ = "competitors"
    __table_args__ = (
        UniqueConstraint("project_id", "domain", name="uq_competitors_project_domain"),
        Index("ix_competitors_project_id", "project_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    domain: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    project: Mapped["Project"] = relationship(back_populates="competitors")


class Keyword(Base):
    __tablename__ = "keywords"
    __table_args__ = (
        UniqueConstraint("project_id", "keyword", name="uq_keywords_project_keyword"),
        Index("ix_keywords_project_id", "project_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    keyword: Mapped[str] = mapped_column(String(500), nullable=False)
    search_volume: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0"),
    )
    query_template: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=text("true"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    project: Mapped["Project"] = relationship(back_populates="keywords")
    citation_results: Mapped[list["CitationResult"]] = relationship(
        back_populates="keyword",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    measurement_jobs: Mapped[list["MeasurementJob"]] = relationship(
        back_populates="keyword",
        passive_deletes=True,
    )


class MeasurementJob(Base):
    __tablename__ = "measurement_jobs"
    __table_args__ = (
        CheckConstraint(
            "ai_engine in ('perplexity', 'gemini', 'openai')",
            name="measurement_job_engine_allowed",
        ),
        CheckConstraint(
            "status in ('queued', 'running', 'succeeded', 'failed', 'rate_limited')",
            name="measurement_job_status_allowed",
        ),
        UniqueConstraint("idempotency_key", name="uq_measurement_jobs_idempotency_key"),
        Index("ix_measurement_jobs_project_status", "project_id", "status"),
        Index("ix_measurement_jobs_keyword_engine", "keyword_id", "ai_engine"),
        Index("ix_measurement_jobs_requested_at", "requested_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    keyword_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("keywords.id", ondelete="SET NULL"),
        nullable=True,
    )
    ai_engine: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="queued",
        server_default="queued",
    )
    idempotency_key: Mapped[str] = mapped_column(String(255), nullable=False)
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default=text("0"))
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    project: Mapped["Project"] = relationship(back_populates="measurement_jobs")
    keyword: Mapped["Keyword | None"] = relationship(back_populates="measurement_jobs")


class CitationResult(Base):
    __tablename__ = "citation_results"
    __table_args__ = (
        CheckConstraint(
            "cited_position is null or cited_position >= 1",
            name="citation_position_positive",
        ),
        Index(
            "ix_citation_results_keyword_engine_snapshot",
            "keyword_id",
            "ai_engine",
            "snapshot_date",
        ),
        Index("ix_citation_results_snapshot_date", "snapshot_date"),
        Index("ix_citation_results_citations_raw", "citations_raw", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    keyword_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("keywords.id", ondelete="CASCADE"),
        nullable=False,
    )
    ai_engine: Mapped[str] = mapped_column(String(50), nullable=False)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    queried_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    answer_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    citations_raw: Mapped[list | dict] = mapped_column(
        JSONB,
        nullable=False,
        server_default=text("'[]'::jsonb"),
    )
    is_cited: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )
    cited_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    cited_position: Mapped[int | None] = mapped_column(Integer, nullable=True)

    keyword: Mapped["Keyword"] = relationship(back_populates="citation_results")


class CrawlerEvent(Base):
    __tablename__ = "crawler_events"
    __table_args__ = (
        CheckConstraint(
            "risk_level in ('low', 'medium', 'high', 'review')",
            name="crawler_event_risk_allowed",
        ),
        CheckConstraint(
            "policy_action in ('allow', 'block', 'charge', 'review', 'monitor')",
            name="crawler_event_policy_allowed",
        ),
        CheckConstraint(
            "robots_status in ('allowed', 'blocked', 'violated', 'unknown')",
            name="crawler_event_robots_allowed",
        ),
        Index("ix_crawler_events_project_observed", "project_id", "observed_at"),
        Index("ix_crawler_events_crawler", "crawler_name"),
        Index("ix_crawler_events_operator", "operator"),
        Index("ix_crawler_events_status", "status_code"),
        Index("ix_crawler_events_raw_event", "raw_event", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    source: Mapped[str] = mapped_column(String(80), nullable=False, default="manual", server_default="manual")
    host: Mapped[str] = mapped_column(String(255), nullable=False)
    path: Mapped[str] = mapped_column(String(2048), nullable=False)
    path_pattern: Mapped[str | None] = mapped_column(String(500), nullable=True)
    method: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status_code: Mapped[int] = mapped_column(Integer, nullable=False)
    request_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default=text("1"))
    bytes_transferred: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0, server_default=text("0"))
    detection_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    crawler_name: Mapped[str] = mapped_column(String(255), nullable=False)
    operator: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=text("false"))
    ip_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    asn: Mapped[str | None] = mapped_column(String(80), nullable=True)
    country: Mapped[str | None] = mapped_column(String(2), nullable=True)
    referrer_host: Mapped[str | None] = mapped_column(String(255), nullable=True)
    robots_status: Mapped[str] = mapped_column(String(50), nullable=False, default="unknown", server_default="unknown")
    policy_action: Mapped[str] = mapped_column(String(50), nullable=False, default="monitor", server_default="monitor")
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False, default="review", server_default="review")
    raw_event: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    project: Mapped["Project"] = relationship(back_populates="crawler_events")
    ppc_events: Mapped[list["PPCEvent"]] = relationship(back_populates="crawler_event")


class PPCPriceRule(Base):
    __tablename__ = "ppc_price_rules"
    __table_args__ = (
        CheckConstraint(
            "action in ('allow', 'block', 'charge', 'review')",
            name="ppc_price_rule_action_allowed",
        ),
        CheckConstraint("price_minor >= 0", name="ppc_price_rule_price_non_negative"),
        Index("ix_ppc_price_rules_project_active", "project_id", "is_active"),
        Index("ix_ppc_price_rules_path_pattern", "path_pattern"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    path_pattern: Mapped[str] = mapped_column(String(500), nullable=False)
    operator: Mapped[str | None] = mapped_column(String(255), nullable=True)
    crawler_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False, default="review", server_default="review")
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="JPY", server_default="JPY")
    price_minor: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default=text("0"))
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=100, server_default=text("100"))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    project: Mapped["Project"] = relationship(back_populates="ppc_price_rules")
    ppc_events: Mapped[list["PPCEvent"]] = relationship(back_populates="price_rule")


class PPCEvent(Base):
    __tablename__ = "ppc_events"
    __table_args__ = (
        CheckConstraint(
            "decision in ('candidate', 'charged', 'rejected', 'blocked', 'allowed', 'review')",
            name="ppc_event_decision_allowed",
        ),
        CheckConstraint(
            "charge_status in ('not_attempted', 'recorded', 'reconciled', 'payout_pending', 'paid', 'failed')",
            name="ppc_event_charge_status_allowed",
        ),
        CheckConstraint(
            "signature_status in ('valid', 'missing', 'invalid', 'not_applicable')",
            name="ppc_event_signature_status_allowed",
        ),
        Index("ix_ppc_events_project_observed", "project_id", "observed_at"),
        Index("ix_ppc_events_decision", "decision"),
        Index("ix_ppc_events_charge_status", "charge_status"),
        Index("ix_ppc_events_raw_event", "raw_event", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    crawler_event_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("crawler_events.id", ondelete="SET NULL"),
        nullable=True,
    )
    price_rule_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ppc_price_rules.id", ondelete="SET NULL"),
        nullable=True,
    )
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    crawler_name: Mapped[str] = mapped_column(String(255), nullable=False)
    operator: Mapped[str | None] = mapped_column(String(255), nullable=True)
    path: Mapped[str] = mapped_column(String(2048), nullable=False)
    status_code: Mapped[int] = mapped_column(Integer, nullable=False, default=402, server_default=text("402"))
    decision: Mapped[str] = mapped_column(String(50), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="JPY", server_default="JPY")
    rule_price_minor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    crawler_exact_price_minor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    crawler_max_price_minor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    signature_status: Mapped[str] = mapped_column(String(50), nullable=False, default="not_applicable", server_default="not_applicable")
    payment_header_signed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=text("false"))
    charge_status: Mapped[str] = mapped_column(String(50), nullable=False, default="not_attempted", server_default="not_attempted")
    charge_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_event: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    project: Mapped["Project"] = relationship(back_populates="ppc_events")
    crawler_event: Mapped["CrawlerEvent | None"] = relationship(back_populates="ppc_events")
    price_rule: Mapped["PPCPriceRule | None"] = relationship(back_populates="ppc_events")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_project_created", "project_id", "created_at"),
        Index("ix_audit_logs_action", "action"),
        Index("ix_audit_logs_metadata", "metadata_json", postgresql_using="gin"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
    )
    actor_type: Mapped[str] = mapped_column(String(80), nullable=False, default="system", server_default="system")
    actor_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    ip_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    project: Mapped["Project | None"] = relationship(back_populates="audit_logs")
