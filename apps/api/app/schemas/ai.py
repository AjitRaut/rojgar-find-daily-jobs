from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class RecommendWorkersRequest(BaseModel):
    job_text: str = Field(min_length=5, max_length=4000)
    city: str | None = Field(default=None, max_length=80)
    pincode: str | None = Field(default=None, max_length=16)
    skill_slug: str | None = None


class AnalyzeJobRequest(BaseModel):
    text: str = Field(min_length=5, max_length=4000)
