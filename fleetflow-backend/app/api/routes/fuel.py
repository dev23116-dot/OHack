from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import RequireFinancialAnalyst, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories import fuel as fuel_repo
from app.schemas.fuel import FuelLogCreate, FuelLogResponse, FuelLogUpdate

router = APIRouter(prefix="/fuel", tags=["fuel"])


@router.get("", response_model=list[FuelLogResponse])
def list_fuel_logs(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFinancialAnalyst)],
):
    items = fuel_repo.list_all(db)
    return [FuelLogResponse.model_validate(f) for f in items]


@router.get("/{log_id}", response_model=FuelLogResponse)
def get_fuel_log(
    log_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFinancialAnalyst)],
):
    f = fuel_repo.get_by_id(db, log_id)
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fuel log not found")
    return FuelLogResponse.model_validate(f)


@router.post("", response_model=FuelLogResponse, status_code=status.HTTP_201_CREATED)
def create_fuel_log(
    body: FuelLogCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFinancialAnalyst)],
):
    f = fuel_repo.create(
        db,
        vehicle_id=body.vehicle_id,
        trip_id=body.trip_id,
        liters=body.liters,
        cost=body.cost,
        odometer_reading=body.odometer_reading,
        date=body.date,
    )
    return FuelLogResponse.model_validate(f)


@router.patch("/{log_id}", response_model=FuelLogResponse)
def update_fuel_log(
    log_id: int,
    body: FuelLogUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFinancialAnalyst)],
):
    f = fuel_repo.get_by_id(db, log_id)
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fuel log not found")
    fuel_repo.update(db, f, **body.model_dump(exclude_unset=True))
    return FuelLogResponse.model_validate(f)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fuel_log(
    log_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFinancialAnalyst)],
):
    f = fuel_repo.get_by_id(db, log_id)
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fuel log not found")
    fuel_repo.delete(db, f)
