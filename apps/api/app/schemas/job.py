from datetime import datetime

from pydantic import BaseModel, Field

from app.models.entities import JobStatus


class JobCreateRequest(BaseModel):
    worker_user_id: int = Field(description="Worker user id to hire (direct hire)")
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    skill_id: int | None = None
    budget: float = Field(ge=0)
    location_text: str = Field(min_length=3, max_length=200)
    scheduled_at: datetime | None = None


class JobResponse(BaseModel):
    id: int
    customer_id: int
    worker_id: int
    skill_id: int | None
    title: str
    description: str
    status: JobStatus
    scheduled_at: datetime | None
    budget: float
    location_text: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReviewCreateRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


class ReviewResponse(BaseModel):
    id: int
    job_id: int
    reviewer_customer_id: int
    worker_profile_id: int
    rating: int
    comment: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
