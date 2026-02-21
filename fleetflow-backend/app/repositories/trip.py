from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.trip import Trip


def get_by_id(db: Session, id: int) -> Trip | None:
    return db.get(Trip, id)


def list_all(db: Session) -> list[Trip]:
    return list(db.execute(select(Trip).order_by(Trip.id.desc())).scalars().all())


def create(db: Session, **kwargs) -> Trip:
    t = Trip(**kwargs)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


def update(db: Session, trip: Trip, **kwargs) -> Trip:
    for k, v in kwargs.items():
        if hasattr(trip, k):
            setattr(trip, k, v)
    db.commit()
    db.refresh(trip)
    return trip


def delete(db: Session, trip: Trip) -> None:
    db.delete(trip)
    db.commit()
