"""Application errors mapped to HTTP responses."""

from fastapi import HTTPException, status


class AppError(Exception):
    """Base domain error."""

    def __init__(self, message: str, code: str = "error"):
        self.message = message
        self.code = code


class NotFoundError(AppError):
    def __init__(self, message: str = "Not found"):
        super().__init__(message, code="not_found")


class PermissionDeniedError(AppError):
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message, code="permission_denied")


class ConflictError(AppError):
    def __init__(self, message: str = "Conflict"):
        super().__init__(message, code="conflict")


def http_from_app_error(exc: AppError) -> HTTPException:
    status_code = status.HTTP_400_BAD_REQUEST
    if isinstance(exc, NotFoundError):
        status_code = status.HTTP_404_NOT_FOUND
    elif isinstance(exc, PermissionDeniedError):
        status_code = status.HTTP_403_FORBIDDEN
    elif isinstance(exc, ConflictError):
        status_code = status.HTTP_409_CONFLICT
    return HTTPException(
        status_code=status_code,
        detail={"code": exc.code, "message": exc.message},
    )
