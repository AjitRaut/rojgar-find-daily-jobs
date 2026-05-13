from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Skill
from app.schemas.worker import SkillOut

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("", response_model=list[SkillOut])
def list_skills(db: Session = Depends(get_db)):
    return db.query(Skill).order_by(Skill.name).all()
