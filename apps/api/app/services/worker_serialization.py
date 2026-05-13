from sqlalchemy.orm import Session

from app.models.entities import Skill, WorkerProfile, WorkerSkill
from app.schemas.worker import WorkerPublicResponse, WorkerSkillOut


def worker_to_public(db: Session, wp: WorkerProfile) -> WorkerPublicResponse:
    rows = (
        db.query(WorkerSkill, Skill)
        .join(Skill, WorkerSkill.skill_id == Skill.id)
        .filter(WorkerSkill.worker_profile_id == wp.id)
        .all()
    )
    skills: list[WorkerSkillOut] = []
    for ws, sk in rows:
        skills.append(
            WorkerSkillOut(
                skill_id=sk.id,
                skill_slug=sk.slug,
                skill_name=sk.name,
                rate_amount=ws.rate_amount,
                rate_unit=ws.rate_unit,
                notes=ws.notes,
            )
        )
    return WorkerPublicResponse(
        id=wp.id,
        user_id=wp.user_id,
        display_name=wp.display_name,
        bio=wp.bio or "",
        experience_years=wp.experience_years or 0,
        base_city=wp.base_city,
        base_pincode=wp.base_pincode,
        rating_avg=float(wp.rating_avg or 0),
        total_jobs=wp.total_jobs or 0,
        verification_status=wp.verification_status,
        skills=skills,
    )
