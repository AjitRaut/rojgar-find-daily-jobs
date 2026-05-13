from fastapi import APIRouter

from app.api.v1.endpoints import admin, ai, auth, complaints, jobs, skills, workers

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(skills.router)
api_router.include_router(jobs.router)
api_router.include_router(workers.router)
api_router.include_router(complaints.router)
api_router.include_router(ai.router)
api_router.include_router(admin.router)
