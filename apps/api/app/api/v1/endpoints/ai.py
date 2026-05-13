import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.entities import User, UserRole, WorkerProfile
from app.schemas.ai import AnalyzeJobRequest, ChatRequest, RecommendWorkersRequest
from app.services.ai_service import AIService, with_ai_rate_limit

router = APIRouter(prefix="/ai", tags=["ai"])
ai_service = AIService()
logger = logging.getLogger(__name__)


@router.post("/chat")
def chat_with_assistant(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    def run() -> dict:
        reply = ai_service.get_chat_reply(payload.message, user_id=current_user.id)
        logger.info(
            "ai_chat user_id=%s prompt_hash=%s",
            current_user.id,
            payload.message[:50],
        )
        return {"reply": reply}

    return with_ai_rate_limit(current_user.id, run)


@router.post("/recommend-workers")
def recommend_workers(
    payload: RecommendWorkersRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    def run() -> dict:
        recs = ai_service.recommend_workers(
            db,
            payload.job_text,
            payload.city,
            payload.pincode,
            payload.skill_slug,
        )
        return {"recommendations": recs}

    return with_ai_rate_limit(current_user.id, run)


@router.post("/analyze-job")
def analyze_job(
    payload: AnalyzeJobRequest,
    current_user: User = Depends(get_current_user),
):
    def run() -> dict:
        return ai_service.analyze_job_description(payload.text)

    return with_ai_rate_limit(current_user.id, run)


@router.post("/profile-tips")
def profile_tips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from fastapi import HTTPException, status

    if current_user.role != UserRole.worker:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Worker role required",
        )
    wp = db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).first()
    if not wp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")

    def run() -> dict:
        tips = ai_service.profile_suggestions(wp.bio or "", wp.experience_years or 0)
        return {"suggestions": tips}

    return with_ai_rate_limit(current_user.id, run)
