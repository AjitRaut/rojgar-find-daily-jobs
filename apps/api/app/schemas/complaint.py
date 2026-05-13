from datetime import datetime

from pydantic import BaseModel, Field

from app.models.entities import ComplaintStatus


class ComplaintCreateRequest(BaseModel):
    description: str = Field(min_length=10, max_length=4000)
    subject_worker_profile_id: int | None = None
    subject_job_id: int | None = None


class ComplaintResponse(BaseModel):
    id: int
    reporter_id: int
    subject_worker_profile_id: int | None
    subject_job_id: int | None
    description: str
    status: ComplaintStatus
    admin_notes: str | None
    created_at: datetime
    resolved_at: datetime | None

    model_config = {"from_attributes": True}


class ComplaintAdminResolve(BaseModel):
    """Admin updates complaint workflow."""

    status: ComplaintStatus
    admin_notes: str | None = Field(default=None, max_length=4000)
