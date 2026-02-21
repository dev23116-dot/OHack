from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.fuel import FuelLog


def get_by_id(db: Session, id: int) -> FuelLog | None:
    return db.get(FuelLog, id)


def list_all(db: Session) -> list[FuelLog]:
    return list(db.execute(select(FuelLog).order_by(FuelLog.date.desc())).scalars().all())


def create(db: Session, **kwargs) -> FuelLog:
    f = FuelLog(**kwargs)
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


def update(db: Session, log: FuelLog, **kwargs) -> FuelLog:
    for k, v in kwargs.items():
        if hasattr(log, k):
            setattr(log, k, v)
    db.commit()
    db.refresh(log)
    return log


def delete(db: Session, log: FuelLog) -> None:
    db.delete(log)
    db.commit()
