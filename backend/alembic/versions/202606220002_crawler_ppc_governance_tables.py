"""crawler ppc governance tables

Revision ID: 202606220002
Revises: 202606220001
Create Date: 2026-06-22
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "202606220002"
down_revision = "202606220001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "crawler_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("observed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("source", sa.String(length=80), server_default="manual", nullable=False),
        sa.Column("host", sa.String(length=255), nullable=False),
        sa.Column("path", sa.String(length=2048), nullable=False),
        sa.Column("path_pattern", sa.String(length=500), nullable=True),
        sa.Column("method", sa.String(length=20), nullable=True),
        sa.Column("status_code", sa.Integer(), nullable=False),
        sa.Column("request_count", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("bytes_transferred", sa.BigInteger(), server_default=sa.text("0"), nullable=False),
        sa.Column("detection_id", sa.String(length=100), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("crawler_name", sa.String(length=255), nullable=False),
        sa.Column("operator", sa.String(length=255), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("ip_hash", sa.String(length=128), nullable=True),
        sa.Column("asn", sa.String(length=80), nullable=True),
        sa.Column("country", sa.String(length=2), nullable=True),
        sa.Column("referrer_host", sa.String(length=255), nullable=True),
        sa.Column("robots_status", sa.String(length=50), server_default="unknown", nullable=False),
        sa.Column("policy_action", sa.String(length=50), server_default="monitor", nullable=False),
        sa.Column("risk_level", sa.String(length=50), server_default="review", nullable=False),
        sa.Column("raw_event", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "policy_action in ('allow', 'block', 'charge', 'review', 'monitor')",
            name="ck_crawler_events_crawler_event_policy_allowed",
        ),
        sa.CheckConstraint(
            "risk_level in ('low', 'medium', 'high', 'review')",
            name="ck_crawler_events_crawler_event_risk_allowed",
        ),
        sa.CheckConstraint(
            "robots_status in ('allowed', 'blocked', 'violated', 'unknown')",
            name="ck_crawler_events_crawler_event_robots_allowed",
        ),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], name="fk_crawler_events_project_id_projects", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_crawler_events"),
    )
    op.create_index("ix_crawler_events_crawler", "crawler_events", ["crawler_name"])
    op.create_index("ix_crawler_events_operator", "crawler_events", ["operator"])
    op.create_index("ix_crawler_events_project_observed", "crawler_events", ["project_id", "observed_at"])
    op.create_index("ix_crawler_events_raw_event", "crawler_events", ["raw_event"], postgresql_using="gin")
    op.create_index("ix_crawler_events_status", "crawler_events", ["status_code"])

    op.create_table(
        "ppc_price_rules",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("path_pattern", sa.String(length=500), nullable=False),
        sa.Column("operator", sa.String(length=255), nullable=True),
        sa.Column("crawler_name", sa.String(length=255), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("action", sa.String(length=50), server_default="review", nullable=False),
        sa.Column("currency", sa.String(length=3), server_default="JPY", nullable=False),
        sa.Column("price_minor", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("priority", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "action in ('allow', 'block', 'charge', 'review')",
            name="ck_ppc_price_rules_ppc_price_rule_action_allowed",
        ),
        sa.CheckConstraint("price_minor >= 0", name="ck_ppc_price_rules_ppc_price_rule_price_non_negative"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], name="fk_ppc_price_rules_project_id_projects", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_ppc_price_rules"),
    )
    op.create_index("ix_ppc_price_rules_path_pattern", "ppc_price_rules", ["path_pattern"])
    op.create_index("ix_ppc_price_rules_project_active", "ppc_price_rules", ["project_id", "is_active"])

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("actor_type", sa.String(length=80), server_default="system", nullable=False),
        sa.Column("actor_id", sa.String(length=255), nullable=True),
        sa.Column("action", sa.String(length=255), nullable=False),
        sa.Column("resource_type", sa.String(length=100), nullable=False),
        sa.Column("resource_id", sa.String(length=255), nullable=True),
        sa.Column("metadata_json", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column("ip_hash", sa.String(length=128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], name="fk_audit_logs_project_id_projects", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_audit_logs"),
    )
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])
    op.create_index("ix_audit_logs_metadata", "audit_logs", ["metadata_json"], postgresql_using="gin")
    op.create_index("ix_audit_logs_project_created", "audit_logs", ["project_id", "created_at"])

    op.create_table(
        "ppc_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("crawler_event_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("price_rule_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("observed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("crawler_name", sa.String(length=255), nullable=False),
        sa.Column("operator", sa.String(length=255), nullable=True),
        sa.Column("path", sa.String(length=2048), nullable=False),
        sa.Column("status_code", sa.Integer(), server_default=sa.text("402"), nullable=False),
        sa.Column("decision", sa.String(length=50), nullable=False),
        sa.Column("currency", sa.String(length=3), server_default="JPY", nullable=False),
        sa.Column("rule_price_minor", sa.Integer(), nullable=True),
        sa.Column("crawler_exact_price_minor", sa.Integer(), nullable=True),
        sa.Column("crawler_max_price_minor", sa.Integer(), nullable=True),
        sa.Column("signature_status", sa.String(length=50), server_default="not_applicable", nullable=False),
        sa.Column("payment_header_signed", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("charge_status", sa.String(length=50), server_default="not_attempted", nullable=False),
        sa.Column("charge_reference", sa.String(length=255), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("raw_event", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "charge_status in ('not_attempted', 'recorded', 'reconciled', 'payout_pending', 'paid', 'failed')",
            name="ck_ppc_events_ppc_event_charge_status_allowed",
        ),
        sa.CheckConstraint(
            "decision in ('candidate', 'charged', 'rejected', 'blocked', 'allowed', 'review')",
            name="ck_ppc_events_ppc_event_decision_allowed",
        ),
        sa.CheckConstraint(
            "signature_status in ('valid', 'missing', 'invalid', 'not_applicable')",
            name="ck_ppc_events_ppc_event_signature_status_allowed",
        ),
        sa.ForeignKeyConstraint(["crawler_event_id"], ["crawler_events.id"], name="fk_ppc_events_crawler_event_id_crawler_events", ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["price_rule_id"], ["ppc_price_rules.id"], name="fk_ppc_events_price_rule_id_ppc_price_rules", ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], name="fk_ppc_events_project_id_projects", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_ppc_events"),
    )
    op.create_index("ix_ppc_events_charge_status", "ppc_events", ["charge_status"])
    op.create_index("ix_ppc_events_decision", "ppc_events", ["decision"])
    op.create_index("ix_ppc_events_project_observed", "ppc_events", ["project_id", "observed_at"])
    op.create_index("ix_ppc_events_raw_event", "ppc_events", ["raw_event"], postgresql_using="gin")


def downgrade() -> None:
    op.drop_index("ix_ppc_events_raw_event", table_name="ppc_events")
    op.drop_index("ix_ppc_events_project_observed", table_name="ppc_events")
    op.drop_index("ix_ppc_events_decision", table_name="ppc_events")
    op.drop_index("ix_ppc_events_charge_status", table_name="ppc_events")
    op.drop_table("ppc_events")

    op.drop_index("ix_audit_logs_project_created", table_name="audit_logs")
    op.drop_index("ix_audit_logs_metadata", table_name="audit_logs")
    op.drop_index("ix_audit_logs_action", table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index("ix_ppc_price_rules_project_active", table_name="ppc_price_rules")
    op.drop_index("ix_ppc_price_rules_path_pattern", table_name="ppc_price_rules")
    op.drop_table("ppc_price_rules")

    op.drop_index("ix_crawler_events_status", table_name="crawler_events")
    op.drop_index("ix_crawler_events_raw_event", table_name="crawler_events")
    op.drop_index("ix_crawler_events_project_observed", table_name="crawler_events")
    op.drop_index("ix_crawler_events_operator", table_name="crawler_events")
    op.drop_index("ix_crawler_events_crawler", table_name="crawler_events")
    op.drop_table("crawler_events")
