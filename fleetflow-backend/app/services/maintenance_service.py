from sqlalchemy.orm import Session

from app.models.maintenance import MaintenanceLog
from app.repositories import maintenance as maintenance_repo
from app.repositories import vehicle as vehicle_repo


def create_maintenance(db: Session, **kwargs) -> MaintenanceLog:
    log = maintenance_repo.create(db, **kwargs)
    vehicle = vehicle_repo.get_by_id(db, log.vehicle_id)
    if vehicle and vehicle.status != "In Shop":
        vehicle_repo.update(db, vehicle, status="In Shop")
    return log


def complete_maintenance(db: Session, log: MaintenanceLog) -> MaintenanceLog:
    maintenance_repo.update(db, log, completed=True)
    from sqlalchemy import select
    other_incomplete = db.execute(
        select(MaintenanceLog).where(
            MaintenanceLog.vehicle_id == log.vehicle_id,
            MaintenanceLog.id != log.id,
            MaintenanceLog.completed == False,
        )
    ).scalar_one_or_none()
    if not other_incomplete:
        vehicle = vehicle_repo.get_by_id(db, log.vehicle_id)
        if vehicle:
            vehicle_repo.update(db, vehicle, status="Available")
    db.refresh(log)
    return log
