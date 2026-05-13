import hashlib
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from app.core.config import settings


def _password_digest(password: str) -> bytes:
    """Bcrypt only accepts 72 raw bytes; hash first so long UTF-8 passwords work."""
    return hashlib.sha256(password.encode("utf-8")).digest()


def hash_password(password: str) -> str:
    digest = _password_digest(password)
    return bcrypt.hashpw(digest, bcrypt.gensalt()).decode("ascii")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    h = hashed_password.encode("ascii")
    if bcrypt.checkpw(_password_digest(plain_password), h):
        return True
    # Legacy passlib: bcrypt of raw UTF-8 (only first 72 bytes used by bcrypt).
    raw = plain_password.encode("utf-8")[:72]
    return bcrypt.checkpw(raw, h)


def create_access_token(subject: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(
        payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )
