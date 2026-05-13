"""Job lifecycle and review side effects."""

from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, PermissionDeniedError
from app.models.entities import (
    JobRequest,
    JobStatus,
    Review,
    User,
    UserRole,
    WorkerProfile,
)


class JobService:
    def get_job_or_404(self, db: Session, job_id: int) -> JobRequest:
        job = db.query(JobRequest).filter(JobRequest.id == job_id).first()
        if not job:
            raise NotFoundError("Job not found")
        return job

    def assert_customer_owns(self, job: JobRequest, user: User) -> None:
        if user.role != UserRole.customer or job.customer_id != user.id:
            raise PermissionDeniedError("Only the customer can perform this action")

    def assert_worker_assigned(self, job: JobRequest, user: User) -> None:
        if user.role != UserRole.worker or job.worker_id != user.id:
            raise PermissionDeniedError("Only the assigned worker can perform this action")

    def accept_job(self, db: Session, job: JobRequest, worker: User) -> JobRequest:
        self.assert_worker_assigned(job, worker)
        if job.status != JobStatus.requested:
            raise ConflictError("Job is not awaiting acceptance")
        job.status = JobStatus.accepted
        db.commit()
        db.refresh(job)
        return job

    def reject_job(self, db: Session, job: JobRequest, worker: User) -> JobRequest:
        self.assert_worker_assigned(job, worker)
        if job.status != JobStatus.requested:
            raise ConflictError("Job cannot be rejected in current status")
        job.status = JobStatus.rejected
        db.commit()
        db.refresh(job)
        return job

    def start_job(self, db: Session, job: JobRequest, worker: User) -> JobRequest:
        self.assert_worker_assigned(job, worker)
        if job.status != JobStatus.accepted:
            raise ConflictError("Job must be accepted before starting")
        job.status = JobStatus.in_progress
        db.commit()
        db.refresh(job)
        return job

    def complete_job(self, db: Session, job: JobRequest, worker: User) -> JobRequest:
        self.assert_worker_assigned(job, worker)
        if job.status not in (JobStatus.accepted, JobStatus.in_progress):
            raise ConflictError("Job cannot be completed in current status")
        job.status = JobStatus.completed
        wp = db.query(WorkerProfile).filter(WorkerProfile.user_id == worker.id).first()
        if wp:
            wp.total_jobs = (wp.total_jobs or 0) + 1
        db.commit()
        db.refresh(job)
        return job

    def cancel_job(self, db: Session, job: JobRequest, customer: User) -> JobRequest:
        self.assert_customer_owns(job, customer)
        if job.status in (JobStatus.completed, JobStatus.cancelled, JobStatus.rejected):
            raise ConflictError("Job cannot be cancelled")
        job.status = JobStatus.cancelled
        db.commit()
        db.refresh(job)
        return job

    def create_review(
        self,
        db: Session,
        job: JobRequest,
        customer: User,
        rating: int,
        comment: str | None,
    ) -> Review:
        self.assert_customer_owns(job, customer)
        if job.status != JobStatus.completed:
            raise ConflictError("You can review only after the job is completed")
        existing = db.query(Review).filter(Review.job_id == job.id).first()
        if existing:
            raise ConflictError("This job already has a review")
        if rating < 1 or rating > 5:
            raise ConflictError("Rating must be between 1 and 5")

        wp = (
            db.query(WorkerProfile)
            .filter(WorkerProfile.user_id == job.worker_id)
            .first()
        )
        if not wp:
            raise NotFoundError("Worker profile not found")

        review = Review(
            job_id=job.id,
            reviewer_customer_id=customer.id,
            worker_profile_id=wp.id,
            rating=rating,
            comment=comment,
        )
        db.add(review)
        db.flush()

        avg = (
            db.query(func.avg(Review.rating))
            .filter(Review.worker_profile_id == wp.id)
            .scalar()
        )
        wp.rating_avg = float(avg) if avg is not None else float(rating)
        db.commit()
        db.refresh(review)
        return review
