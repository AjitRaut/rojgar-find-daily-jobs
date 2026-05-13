import logging
import time
import uuid

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.core.config import cors_origin_list, settings
from app.core.exceptions import AppError, http_from_app_error

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("rojgar_find.api")

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origin_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("request_id=%s path=%s", request_id, request.url.path)
        raise
    dur = (time.perf_counter() - start) * 1000
    response.headers["X-Request-Id"] = request_id
    logger.info(
        "request_id=%s %s %s -> %s %.2fms",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        dur,
    )
    return response


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError):
    he = http_from_app_error(exc)
    return JSONResponse(status_code=he.status_code, content=he.detail)


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    detail = exc.detail
    if isinstance(detail, str):
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": "http_error", "message": detail},
        )
    return JSONResponse(status_code=exc.status_code, content=detail)


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"code": "validation_error", "errors": exc.errors()},
    )


app.include_router(api_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name}
