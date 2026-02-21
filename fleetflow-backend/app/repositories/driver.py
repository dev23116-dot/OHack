from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.driver import Driver


def get_by_id(db: Session, id: int) -> Driver | None:
    return db.get(Driver, id)


def list_all(db: Session) -> list[Driver]:
    return list(db.execute(select(Driver).order_by(Driver.id)).scalars().all())


def create(db: Session, **kwargs) -> Driver:
    d = Driver(**kwargs)
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


def update(db: Session, driver: Driver, **kwargs) -> Driver:
    for k, v in kwargs.items():
        if hasattr(driver, k):
            setattr(driver, k, v)
    db.commit()
    db.refresh(driver)
    return driver


def delete(db: Session, driver: Driver) -> None:
    db.delete(driver)
    db.commit()
