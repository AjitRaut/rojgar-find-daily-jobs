"""initial schema for Rojgar Find – Daily Jobs Balanced MVP

Revision ID: 001_initial
Revises:
Create Date: 2026-02-09
"""

from alembic import op
import sqlalchemy as sa


revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id", "users", ["id"])

    op.create_table(
        "skills",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=True),
    )
    op.create_index("ix_skills_slug", "skills", ["slug"], unique=True)

    op.create_table(
        "customer_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("city", sa.String(length=80), nullable=True),
        sa.Column("pincode", sa.String(length=16), nullable=True),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "worker_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("display_name", sa.String(length=120), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("experience_years", sa.Integer(), nullable=True),
        sa.Column("base_city", sa.String(length=80), nullable=True),
        sa.Column("base_pincode", sa.String(length=16), nullable=True),
        sa.Column("rating_avg", sa.Float(), nullable=True),
        sa.Column("total_jobs", sa.Integer(), nullable=True),
        sa.Column("verification_status", sa.String(length=32), nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verified_by_admin_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "worker_skills",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "worker_profile_id",
            sa.Integer(),
            sa.ForeignKey("worker_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("skill_id", sa.Integer(), sa.ForeignKey("skills.id"), nullable=False),
        sa.Column("rate_amount", sa.Float(), nullable=False),
        sa.Column("rate_unit", sa.String(length=32), nullable=False),
        sa.Column("notes", sa.String(length=255), nullable=True),
        sa.UniqueConstraint("worker_profile_id", "skill_id", name="uq_worker_skill"),
    )

    op.create_table(
        "job_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("worker_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("skill_id", sa.Integer(), sa.ForeignKey("skills.id"), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("budget", sa.Float(), nullable=True),
        sa.Column("location_text", sa.String(length=200), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "job_id",
            sa.Integer(),
            sa.ForeignKey("job_requests.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("reviewer_customer_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "worker_profile_id",
            sa.Integer(),
            sa.ForeignKey("worker_profiles.id"),
            nullable=False,
        ),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "complaints",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("reporter_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "subject_worker_profile_id",
            sa.Integer(),
            sa.ForeignKey("worker_profiles.id"),
            nullable=True,
        ),
        sa.Column(
            "subject_job_id",
            sa.Integer(),
            sa.ForeignKey("job_requests.id"),
            nullable=True,
        ),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("admin_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("complaints")
    op.drop_table("reviews")
    op.drop_table("job_requests")
    op.drop_table("worker_skills")
    op.drop_table("worker_profiles")
    op.drop_table("customer_profiles")
    op.drop_table("skills")
    op.drop_table("users")
