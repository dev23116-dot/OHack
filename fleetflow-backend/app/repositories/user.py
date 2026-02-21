from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User, UserRole


def get_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def create(db: Session, email: str, password_hash: str, role: UserRole) -> User:
    u = User(email=email, password_hash=password_hash, role=role)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u
