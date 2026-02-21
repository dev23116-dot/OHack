from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle


def get_by_id(db: Session, id: int) -> Vehicle | None:
    return db.get(Vehicle, id)


def get_by_license_plate(db: Session, license_plate: str) -> Vehicle | None:
    return db.execute(select(Vehicle).where(Vehicle.license_plate == license_plate)).scalar_one_or_none()


def list_all(db: Session) -> list[Vehicle]:
    return list(db.execute(select(Vehicle).order_by(Vehicle.id)).scalars().all())


def create(db: Session, **kwargs) -> Vehicle:
    v = Vehicle(**kwargs)
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


def update(db: Session, vehicle: Vehicle, **kwargs) -> Vehicle:
    for k, v in kwargs.items():
        if hasattr(vehicle, k):
            setattr(vehicle, k, v)
    db.commit()
    db.refresh(vehicle)
    return vehicle


def delete(db: Session, vehicle: Vehicle) -> None:
    db.delete(vehicle)
    db.commit()
