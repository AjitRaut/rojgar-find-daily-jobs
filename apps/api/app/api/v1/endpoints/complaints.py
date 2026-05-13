from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.entities import Complaint, User, UserRole
from app.schemas.complaint import ComplaintCreateRequest, ComplaintResponse

router = APIRouter(prefix="/complaints", tags=["complaints"])


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: ComplaintCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    c = Complaint(
        reporter_id=current_user.id,
        subject_worker_profile_id=payload.subject_worker_profile_id,
        subject_job_id=payload.subject_job_id,
        description=payload.description,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("/mine", response_model=list[ComplaintResponse])
def my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Complaint)
        .filter(Complaint.reporter_id == current_user.id)
        .order_by(Complaint.created_at.desc())
        .all()
    )
