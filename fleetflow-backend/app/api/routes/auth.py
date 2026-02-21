from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_db
from app.models.user import User, UserRole
from app.repositories import user as user_repo
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(
    body: UserCreate,
    db: Annotated[Session, Depends(get_db)],
):
    if user_repo.get_by_email(db, body.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = user_repo.create(
        db,
        email=body.email,
        password_hash=get_password_hash(body.password),
        role=body.role,
    )
    return UserResponse.model_validate(user)


@router.post("/login", response_model=Token)
def login(
    body: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
):
    user = user_repo.get_by_email(db, body.email)
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(subject=user.id, role=user.role.value)
    return Token(access_token=token, token_type="bearer", role=user.role.value)


@router.get("/me", response_model=UserResponse)
def me(current_user: Annotated[User, Depends(get_current_user)]):
    return UserResponse.model_validate(current_user)
