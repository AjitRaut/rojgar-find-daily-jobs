from pydantic import BaseModel, Field

from app.models.entities import RateUnit, VerificationStatus


class WorkerSkillIn(BaseModel):
    skill_id: int
    rate_amount: float = Field(ge=0)
    rate_unit: RateUnit = RateUnit.per_day
    notes: str | None = Field(default=None, max_length=255)


class WorkerProfileUpdateRequest(BaseModel):
    display_name: str | None = Field(default=None, max_length=120)
    bio: str | None = None
    experience_years: int | None = Field(default=None, ge=0, le=80)
    base_city: str | None = Field(default=None, max_length=80)
    base_pincode: str | None = Field(default=None, max_length=16)
    skills: list[WorkerSkillIn] | None = None


class WorkerSkillOut(BaseModel):
    skill_id: int
    skill_slug: str
    skill_name: str
    rate_amount: float
    rate_unit: RateUnit
    notes: str | None

    model_config = {"from_attributes": True}


class WorkerPublicResponse(BaseModel):
    id: int
    user_id: int
    display_name: str | None
    bio: str
    experience_years: int
    base_city: str | None
    base_pincode: str | None
    rating_avg: float
    total_jobs: int
    verification_status: VerificationStatus
    skills: list[WorkerSkillOut] = []


class SkillOut(BaseModel):
    id: int
    slug: str
    name: str
    category: str | None

    model_config = {"from_attributes": True}
