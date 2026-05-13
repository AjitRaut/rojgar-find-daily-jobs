from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.exceptions import AppError, http_from_app_error
from app.db.session import get_db
from app.models.entities import JobRequest, JobStatus, User, UserRole
from app.schemas.job import JobCreateRequest, JobResponse, ReviewCreateRequest, ReviewResponse
from app.services.job_service import JobService

router = APIRouter(prefix="/jobs", tags=["jobs"])
job_service = JobService()


def _list_for_user(db: Session, user: User) -> list[JobRequest]:
    if user.role == UserRole.customer:
        return (
            db.query(JobRequest)
            .filter(JobRequest.customer_id == user.id)
            .order_by(JobRequest.created_at.desc())
            .limit(100)
            .all()
        )
    if user.role == UserRole.worker:
        return (
            db.query(JobRequest)
            .filter(JobRequest.worker_id == user.id)
            .order_by(JobRequest.created_at.desc())
            .limit(100)
            .all()
        )
    return db.query(JobRequest).order_by(JobRequest.created_at.desc()).limit(100).all()


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: JobCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.customer)),
):
    worker = db.query(User).filter(User.id == payload.worker_user_id).first()
    if not worker or worker.role != UserRole.worker:
        raise HTTPException(status_code=400, detail="Invalid worker user")
    job = JobRequest(
        customer_id=current_user.id,
        worker_id=payload.worker_user_id,
        skill_id=payload.skill_id,
        title=payload.title,
        description=payload.description,
        budget=payload.budget,
        location_text=payload.location_text,
        scheduled_at=payload.scheduled_at,
        status=JobStatus.requested,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/mine", response_model=list[JobResponse])
def list_my_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _list_for_user(db, current_user)


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(JobRequest).filter(JobRequest.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.role == UserRole.admin:
        return job
    if job.customer_id == current_user.id or job.worker_id == current_user.id:
        return job
    raise HTTPException(status_code=403, detail="Not allowed to view this job")


@router.post("/{job_id}/accept", response_model=JobResponse)
def accept_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.worker)),
):
    job = db.query(JobRequest).filter(JobRequest.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        return job_service.accept_job(db, job, current_user)
    except AppError as e:
        raise http_from_app_error(e) from e


@router.post("/{job_id}/reject", response_model=JobResponse)
def reject_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.worker)),
):
    job = db.query(JobRequest).filter(JobRequest.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        return job_service.reject_job(db, job, current_user)
    except AppError as e:
        raise http_from_app_error(e) from e


@router.post("/{job_id}/start", response_model=JobResponse)
def start_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.worker)),
):
    job = db.query(JobRequest).filter(JobRequest.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        return job_service.start_job(db, job, current_user)
    except AppError as e:
        raise http_from_app_error(e) from e


@router.post("/{job_id}/complete", response_model=JobResponse)
def complete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.worker)),
):
    job = db.query(JobRequest).filter(JobRequest.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        return job_service.complete_job(db, job, current_user)
    except AppError as e:
        raise http_from_app_error(e) from e


@router.post("/{job_id}/cancel", response_model=JobResponse)
def cancel_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.customer)),
):
    job = db.query(JobRequest).filter(JobRequest.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        return job_service.cancel_job(db, job, current_user)
    except AppError as e:
        raise http_from_app_error(e) from e


@router.post("/{job_id}/review", response_model=ReviewResponse)
def review_job(
    job_id: int,
    payload: ReviewCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.customer)),
):
    job = db.query(JobRequest).filter(JobRequest.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        rev = job_service.create_review(
            db,
            job,
            current_user,
            payload.rating,
            payload.comment,
        )
        return rev
    except AppError as e:
        raise http_from_app_error(e) from e
