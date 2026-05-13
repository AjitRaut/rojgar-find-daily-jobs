from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.entities import (
    Complaint,
    ComplaintStatus,
    JobRequest,
    User,
    UserRole,
    VerificationStatus,
    WorkerProfile,
)
from app.schemas.complaint import ComplaintAdminResolve, ComplaintResponse
from app.schemas.worker import WorkerPublicResponse
from app.services.worker_serialization import worker_to_public

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/metrics")
def admin_metrics(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin)),
):
    return {
        "total_users": db.query(User).count(),
        "total_workers": db.query(WorkerProfile).count(),
        "total_jobs": db.query(JobRequest).count(),
        "pending_verifications": db.query(WorkerProfile)
        .filter(WorkerProfile.verification_status == VerificationStatus.pending)
        .count(),
        "open_complaints": db.query(Complaint)
        .filter(Complaint.status == ComplaintStatus.open)
        .count(),
    }


@router.get("/verifications", response_model=list[WorkerPublicResponse])
def list_verifications(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin)),
    status_filter: VerificationStatus | None = Query(default=VerificationStatus.pending),
):
    q = db.query(WorkerProfile)
    if status_filter is not None:
        q = q.filter(WorkerProfile.verification_status == status_filter)
    profiles = q.order_by(WorkerProfile.id.desc()).limit(200).all()
    return [worker_to_public(db, p) for p in profiles]


@router.post("/verifications/{worker_profile_id}/approve", response_model=WorkerPublicResponse)
def approve_worker(
    worker_profile_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(UserRole.admin)),
):
    wp = db.query(WorkerProfile).filter(WorkerProfile.id == worker_profile_id).first()
    if not wp:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    wp.verification_status = VerificationStatus.verified
    wp.verified_at = datetime.now(timezone.utc)
    wp.verified_by_admin_id = admin_user.id
    db.commit()
    db.refresh(wp)
    return worker_to_public(db, wp)


@router.post("/verifications/{worker_profile_id}/reject", response_model=WorkerPublicResponse)
def reject_worker(
    worker_profile_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(UserRole.admin)),
):
    wp = db.query(WorkerProfile).filter(WorkerProfile.id == worker_profile_id).first()
    if not wp:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    wp.verification_status = VerificationStatus.rejected
    wp.verified_at = datetime.now(timezone.utc)
    wp.verified_by_admin_id = admin_user.id
    db.commit()
    db.refresh(wp)
    return worker_to_public(db, wp)


@router.get("/complaints", response_model=list[ComplaintResponse])
def list_complaints(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin)),
):
    return (
        db.query(Complaint).order_by(Complaint.created_at.desc()).limit(200).all()
    )


@router.post("/complaints/{complaint_id}/resolve", response_model=ComplaintResponse)
def resolve_complaint(
    complaint_id: int,
    payload: ComplaintAdminResolve,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin)),
):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    c.status = payload.status
    if payload.admin_notes is not None:
        c.admin_notes = payload.admin_notes
    if payload.status in (ComplaintStatus.resolved, ComplaintStatus.rejected):
        c.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(c)
    return c
