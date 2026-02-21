from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.maintenance import MaintenanceLog


def get_by_id(db: Session, id: int) -> MaintenanceLog | None:
    return db.get(MaintenanceLog, id)


def list_all(db: Session) -> list[MaintenanceLog]:
    return list(db.execute(select(MaintenanceLog).order_by(MaintenanceLog.date.desc())).scalars().all())


def create(db: Session, **kwargs) -> MaintenanceLog:
    m = MaintenanceLog(**kwargs)
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


def update(db: Session, log: MaintenanceLog, **kwargs) -> MaintenanceLog:
    for k, v in kwargs.items():
        if hasattr(log, k):
            setattr(log, k, v)
    db.commit()
    db.refresh(log)
    return log


def delete(db: Session, log: MaintenanceLog) -> None:
    db.delete(log)
    db.commit()
