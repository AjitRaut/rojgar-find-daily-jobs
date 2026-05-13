from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.entities import Skill, User, UserRole, WorkerProfile, WorkerSkill
from app.schemas.worker import WorkerProfileUpdateRequest, WorkerPublicResponse
from app.services.ai_service import AIService
from app.services.worker_serialization import worker_to_public

router = APIRouter(prefix="/workers", tags=["workers"])
ai_service = AIService()


@router.get("", response_model=list[WorkerPublicResponse])
def search_workers(
    db: Session = Depends(get_db),
    skill: str | None = Query(default=None, description="Skill slug"),
    city: str | None = None,
    pincode: str | None = None,
    q: str | None = Query(default=None, description="Search in bio / display name"),
):
    query = db.query(WorkerProfile).options(joinedload(WorkerProfile.user))

    if skill:
        sk = db.query(Skill).filter(Skill.slug == skill).first()
        if sk:
            wids = [
                r[0]
                for r in db.query(WorkerSkill.worker_profile_id)
                .filter(WorkerSkill.skill_id == sk.id)
                .distinct()
                .all()
            ]
            if wids:
                query = query.filter(WorkerProfile.id.in_(wids))
            else:
                return []

    if city:
        query = query.filter(WorkerProfile.base_city.ilike(f"%{city}%"))
    if pincode:
        query = query.filter(WorkerProfile.base_pincode == pincode)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                WorkerProfile.bio.ilike(like),
                WorkerProfile.display_name.ilike(like),
            )
        )

    results = query.order_by(desc(WorkerProfile.rating_avg).nullslast()).limit(80).all()
    return [worker_to_public(db, wp) for wp in results]


@router.put("/me", response_model=WorkerPublicResponse)
def update_my_worker_profile(
    payload: WorkerProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.worker)),
):
    wp = db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).first()
    if not wp:
        wp = WorkerProfile(user_id=current_user.id)
        db.add(wp)
        db.flush()

    if payload.display_name is not None:
        wp.display_name = payload.display_name
    if payload.bio is not None:
        wp.bio = payload.bio
    if payload.experience_years is not None:
        wp.experience_years = payload.experience_years
    if payload.base_city is not None:
        wp.base_city = payload.base_city
    if payload.base_pincode is not None:
        wp.base_pincode = payload.base_pincode

    if payload.skills is not None:
        db.query(WorkerSkill).filter(WorkerSkill.worker_profile_id == wp.id).delete()
        for s in payload.skills:
            db.add(
                WorkerSkill(
                    worker_profile_id=wp.id,
                    skill_id=s.skill_id,
                    rate_amount=s.rate_amount,
                    rate_unit=s.rate_unit,
                    notes=s.notes,
                )
            )

    db.commit()
    db.refresh(wp)
    return worker_to_public(db, wp)


@router.get("/me", response_model=WorkerPublicResponse)
def get_my_worker_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.worker)),
):
    wp = db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).first()
    if not wp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found",
        )
    return worker_to_public(db, wp)


@router.get("/me/profile-suggestions")
def profile_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.worker)),
):
    wp = db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).first()
    if not wp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")
    return {"suggestions": ai_service.profile_suggestions(wp.bio or "", wp.experience_years or 0)}


@router.get("/{profile_id}", response_model=WorkerPublicResponse)
def get_worker(profile_id: int, db: Session = Depends(get_db)):
    wp = db.query(WorkerProfile).filter(WorkerProfile.id == profile_id).first()
    if not wp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
    return worker_to_public(db, wp)
