"""initial enterprise schema

Revision ID: 202606220001
Revises:
Create Date: 2026-06-22
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "202606220001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "accounts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("plan", sa.String(length=50), server_default="free", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "plan in ('free', 'standard', 'agency', 'enterprise')",
            name="ck_accounts_account_plan_allowed",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_accounts"),
    )

    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("target_domain", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"], name="fk_projects_account_id_accounts", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_projects"),
        sa.UniqueConstraint("account_id", "target_domain", name="uq_projects_account_target_domain"),
    )
    op.create_index("ix_projects_account_id", "projects", ["account_id"])

    op.create_table(
        "competitors",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("domain", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], name="fk_competitors_project_id_projects", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_competitors"),
        sa.UniqueConstraint("project_id", "domain", name="uq_competitors_project_domain"),
    )
    op.create_index("ix_competitors_project_id", "competitors", ["project_id"])

    op.create_table(
        "keywords",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("keyword", sa.String(length=500), nullable=False),
        sa.Column("search_volume", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("query_template", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], name="fk_keywords_project_id_projects", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_keywords"),
        sa.UniqueConstraint("project_id", "keyword", name="uq_keywords_project_keyword"),
    )
    op.create_index("ix_keywords_project_id", "keywords", ["project_id"])

    op.create_table(
        "measurement_jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("keyword_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("ai_engine", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), server_default="queued", nullable=False),
        sa.Column("idempotency_key", sa.String(length=255), nullable=False),
        sa.Column("requested_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("retry_count", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.CheckConstraint(
            "ai_engine in ('perplexity', 'gemini', 'openai')",
            name="ck_measurement_jobs_measurement_job_engine_allowed",
        ),
        sa.CheckConstraint(
            "status in ('queued', 'running', 'succeeded', 'failed', 'rate_limited')",
            name="ck_measurement_jobs_measurement_job_status_allowed",
        ),
        sa.ForeignKeyConstraint(["keyword_id"], ["keywords.id"], name="fk_measurement_jobs_keyword_id_keywords", ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], name="fk_measurement_jobs_project_id_projects", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_measurement_jobs"),
        sa.UniqueConstraint("idempotency_key", name="uq_measurement_jobs_idempotency_key"),
    )
    op.create_index("ix_measurement_jobs_keyword_engine", "measurement_jobs", ["keyword_id", "ai_engine"])
    op.create_index("ix_measurement_jobs_project_status", "measurement_jobs", ["project_id", "status"])
    op.create_index("ix_measurement_jobs_requested_at", "measurement_jobs", ["requested_at"])

    op.create_table(
        "citation_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("keyword_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ai_engine", sa.String(length=50), nullable=False),
        sa.Column("snapshot_date", sa.Date(), nullable=False),
        sa.Column("queried_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("answer_text", sa.Text(), nullable=True),
        sa.Column("citations_raw", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'[]'::jsonb"), nullable=False),
        sa.Column("is_cited", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("cited_url", sa.String(length=2048), nullable=True),
        sa.Column("cited_position", sa.Integer(), nullable=True),
        sa.CheckConstraint(
            "cited_position is null or cited_position >= 1",
            name="ck_citation_results_citation_position_positive",
        ),
        sa.ForeignKeyConstraint(["keyword_id"], ["keywords.id"], name="fk_citation_results_keyword_id_keywords", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_citation_results"),
    )
    op.create_index("ix_citation_results_citations_raw", "citation_results", ["citations_raw"], postgresql_using="gin")
    op.create_index("ix_citation_results_keyword_engine_snapshot", "citation_results", ["keyword_id", "ai_engine", "snapshot_date"])
    op.create_index("ix_citation_results_snapshot_date", "citation_results", ["snapshot_date"])


def downgrade() -> None:
    op.drop_index("ix_citation_results_snapshot_date", table_name="citation_results")
    op.drop_index("ix_citation_results_keyword_engine_snapshot", table_name="citation_results")
    op.drop_index("ix_citation_results_citations_raw", table_name="citation_results")
    op.drop_table("citation_results")

    op.drop_index("ix_measurement_jobs_requested_at", table_name="measurement_jobs")
    op.drop_index("ix_measurement_jobs_project_status", table_name="measurement_jobs")
    op.drop_index("ix_measurement_jobs_keyword_engine", table_name="measurement_jobs")
    op.drop_table("measurement_jobs")

    op.drop_index("ix_keywords_project_id", table_name="keywords")
    op.drop_table("keywords")

    op.drop_index("ix_competitors_project_id", table_name="competitors")
    op.drop_table("competitors")

    op.drop_index("ix_projects_account_id", table_name="projects")
    op.drop_table("projects")

    op.drop_table("accounts")
