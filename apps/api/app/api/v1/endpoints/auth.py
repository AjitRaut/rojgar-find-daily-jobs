from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.entities import CustomerProfile, User, UserRole, WorkerProfile
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_response(u: User) -> UserResponse:
    return UserResponse.model_validate(u)


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if payload.role == UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Register as customer or worker. Admin accounts are provisioned separately.",
        )
    existing = db.query(User).filter(User.email == str(payload.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "email_taken", "message": "Email already registered"},
        )

    user = User(
        full_name=payload.full_name,
        email=str(payload.email),
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.flush()

    if payload.role == UserRole.customer:
        db.add(
            CustomerProfile(
                user_id=user.id,
                city=payload.city,
                pincode=payload.pincode,
            )
        )
    elif payload.role == UserRole.worker:
        db.add(
            WorkerProfile(
                user_id=user.id,
                display_name=payload.full_name,
                bio="",
                base_city=payload.city,
                base_pincode=payload.pincode,
            )
        )

    db.commit()
    db.refresh(user)
    token = create_access_token(str(user.id), user.role.value)
    return TokenResponse(
        access_token=token,
        user=_user_response(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == str(payload.email)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "invalid_credentials", "message": "Invalid credentials"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "inactive", "message": "Account disabled"},
        )
    token = create_access_token(str(user.id), user.role.value)
    return TokenResponse(access_token=token, user=_user_response(user))


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return _user_response(current_user)
