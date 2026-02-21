from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.trip import Trip
from app.repositories import driver as driver_repo
from app.repositories import trip as trip_repo
from app.repositories import vehicle as vehicle_repo


class TripValidationError(Exception):
    pass


def _today() -> date:
    return date.today()


def validate_trip_creation(
    db: Session,
    vehicle_id: int,
    driver_id: int,
    cargo_weight: int,
) -> None:
    vehicle = vehicle_repo.get_by_id(db, vehicle_id)
    if not vehicle:
        raise TripValidationError("Vehicle not found")
    if vehicle.status != "Available":
        raise TripValidationError("Vehicle is not available for dispatch")
    if cargo_weight > vehicle.max_capacity:
        raise TripValidationError(
            f"Cargo weight ({cargo_weight} kg) exceeds vehicle capacity ({vehicle.max_capacity} kg)"
        )

    driver = driver_repo.get_by_id(db, driver_id)
    if not driver:
        raise TripValidationError("Driver not found")
    if driver.license_expiry < _today():
        raise TripValidationError("Driver license has expired")
    if driver.status not in ("Off Duty", "Available"):
        raise TripValidationError("Driver is not available for dispatch")


def create_trip(db: Session, **kwargs) -> Trip:
    validate_trip_creation(
        db,
        kwargs["vehicle_id"],
        kwargs["driver_id"],
        kwargs.get("cargo_weight", 0),
    )
    return trip_repo.create(db, status="Draft", **kwargs)


def set_trip_dispatched(db: Session, trip: Trip) -> Trip:
    vehicle = vehicle_repo.get_by_id(db, trip.vehicle_id)
    driver = driver_repo.get_by_id(db, trip.driver_id)
    if not vehicle or not driver:
        raise TripValidationError("Vehicle or driver not found")
    if vehicle.status != "Available":
        raise TripValidationError("Vehicle is not available")
    if driver.license_expiry < _today():
        raise TripValidationError("Driver license has expired")
    if driver.status not in ("Off Duty", "Available"):
        raise TripValidationError("Driver is not available")

    trip_repo.update(db, trip, status="Dispatched")
    vehicle_repo.update(db, vehicle, status="On Trip")
    driver_repo.update(db, driver, status="On Duty")
    return trip


def set_trip_completed_or_cancelled(db: Session, trip: Trip, new_status: str) -> Trip:
    vehicle = vehicle_repo.get_by_id(db, trip.vehicle_id)
    driver = driver_repo.get_by_id(db, trip.driver_id)
    completed_at = _today() if new_status == "Completed" else None
    trip_repo.update(db, trip, status=new_status, completed_at=completed_at)

    if vehicle:
        other = db.execute(
            select(Trip).where(
                Trip.vehicle_id == vehicle.id,
                Trip.id != trip.id,
                Trip.status == "Dispatched",
            )
        ).scalar_one_or_none()
        if not other:
            vehicle_repo.update(db, vehicle, status="Available")
    if driver:
        other = db.execute(
            select(Trip).where(
                Trip.driver_id == driver.id,
                Trip.id != trip.id,
                Trip.status == "Dispatched",
            )
        ).scalar_one_or_none()
        if not other:
            driver_repo.update(db, driver, status="Off Duty")
    db.refresh(trip)
    return trip
