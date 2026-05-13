"""SQLAlchemy models – Balanced MVP schema."""

from __future__ import annotations

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.db.session import Base


def enum_col(py_enum: type[enum.Enum]):
    """Store enum values as VARCHAR for simpler migrations / portability."""
    return Enum(py_enum, native_enum=False)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    customer = "customer"
    worker = "worker"
    admin = "admin"


class VerificationStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class JobStatus(str, enum.Enum):
    requested = "requested"
    accepted = "accepted"
    rejected = "rejected"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class RateUnit(str, enum.Enum):
    per_hour = "per_hour"
    per_day = "per_day"
    per_job = "per_job"


class ComplaintStatus(str, enum.Enum):
    open = "open"
    in_review = "in_review"
    resolved = "resolved"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(120), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(enum_col(UserRole), nullable=False, default=UserRole.customer)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    customer_profile = relationship(
        "CustomerProfile", back_populates="user", uselist=False
    )
    worker_profile = relationship(
        "WorkerProfile",
        foreign_keys="WorkerProfile.user_id",
        back_populates="user",
        uselist=False,
    )
    jobs_as_customer = relationship(
        "JobRequest",
        foreign_keys="JobRequest.customer_id",
        back_populates="customer",
    )
    jobs_as_worker = relationship(
        "JobRequest",
        foreign_keys="JobRequest.worker_id",
        back_populates="worker_user",
    )
    complaints_filed = relationship(
        "Complaint",
        foreign_keys="Complaint.reporter_id",
        back_populates="reporter",
    )


class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    city = Column(String(80), nullable=True)
    pincode = Column(String(16), nullable=True)

    user = relationship("User", back_populates="customer_profile")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True)
    slug = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    category = Column(String(80), nullable=True)
    worker_skills = relationship("WorkerSkill", back_populates="skill")


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    display_name = Column(String(120), nullable=True)
    bio = Column(Text, default="")
    experience_years = Column(Integer, default=0)
    base_city = Column(String(80), nullable=True)
    base_pincode = Column(String(16), nullable=True)
    rating_avg = Column(Float, default=0.0)
    total_jobs = Column(Integer, default=0)
    verification_status = Column(
        enum_col(VerificationStatus),
        nullable=False,
        default=VerificationStatus.pending,
    )
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="worker_profile",
    )
    verified_by = relationship(
        "User",
        foreign_keys=[verified_by_admin_id],
        overlaps="user",
    )
    skills = relationship("WorkerSkill", back_populates="worker_profile")


class WorkerSkill(Base):
    __tablename__ = "worker_skills"

    id = Column(Integer, primary_key=True)
    worker_profile_id = Column(
        Integer, ForeignKey("worker_profiles.id", ondelete="CASCADE"), nullable=False
    )
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    rate_amount = Column(Float, nullable=False, default=0)
    rate_unit = Column(enum_col(RateUnit), nullable=False, default=RateUnit.per_day)
    notes = Column(String(255), nullable=True)

    worker_profile = relationship("WorkerProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="worker_skills")

    __table_args__ = (
        UniqueConstraint("worker_profile_id", "skill_id", name="uq_worker_skill"),
    )


class JobRequest(Base):
    __tablename__ = "job_requests"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(enum_col(JobStatus), nullable=False, default=JobStatus.requested)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    budget = Column(Float, default=0)
    location_text = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    customer = relationship(
        "User",
        foreign_keys=[customer_id],
        back_populates="jobs_as_customer",
    )
    worker_user = relationship(
        "User",
        foreign_keys=[worker_id],
        back_populates="jobs_as_worker",
    )
    skill = relationship("Skill")
    review = relationship("Review", back_populates="job", uselist=False)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey("job_requests.id", ondelete="CASCADE"), unique=True, nullable=False)
    reviewer_customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    worker_profile_id = Column(Integer, ForeignKey("worker_profiles.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    job = relationship("JobRequest", back_populates="review")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_worker_profile_id = Column(
        Integer, ForeignKey("worker_profiles.id"), nullable=True
    )
    subject_job_id = Column(Integer, ForeignKey("job_requests.id"), nullable=True)
    description = Column(Text, nullable=False)
    status = Column(
        enum_col(ComplaintStatus), nullable=False, default=ComplaintStatus.open
    )
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    reporter = relationship(
        "User", foreign_keys=[reporter_id], back_populates="complaints_filed"
    )
    subject_worker = relationship("WorkerProfile", foreign_keys=[subject_worker_profile_id])
    subject_job = relationship("JobRequest", foreign_keys=[subject_job_id])
