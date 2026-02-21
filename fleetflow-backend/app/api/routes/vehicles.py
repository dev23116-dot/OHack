from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import RequireFleetManager, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.repositories import vehicle as vehicle_repo
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.get("", response_model=list[VehicleResponse])
def list_vehicles(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
):
    items = vehicle_repo.list_all(db)
    return [VehicleResponse.model_validate(v) for v in items]


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
):
    v = vehicle_repo.get_by_id(db, vehicle_id)
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return VehicleResponse.model_validate(v)


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    body: VehicleCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
):
    if vehicle_repo.get_by_license_plate(db, body.license_plate):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License plate already exists")
    v = vehicle_repo.create(
        db,
        name=body.name,
        model=body.model,
        license_plate=body.license_plate,
        type=body.type,
        max_capacity=body.max_capacity,
        odometer=body.odometer,
        status=body.status,
        region=body.region,
        acquisition_cost=body.acquisition_cost,
    )
    return VehicleResponse.model_validate(v)


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    body: VehicleUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
):
    v = vehicle_repo.get_by_id(db, vehicle_id)
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    data = body.model_dump(exclude_unset=True)
    if "license_plate" in data and vehicle_repo.get_by_license_plate(db, data["license_plate"]) and v.license_plate != data["license_plate"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License plate already exists")
    vehicle_repo.update(db, v, **data)
    return VehicleResponse.model_validate(v)


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
):
    v = vehicle_repo.get_by_id(db, vehicle_id)
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    vehicle_repo.delete(db, v)


@router.patch("/{vehicle_id}/status", response_model=VehicleResponse)
def set_vehicle_status(
    vehicle_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
    status: str = Query(..., description="Available | On Trip | In Shop | Retired"),
):
    v = vehicle_repo.get_by_id(db, vehicle_id)
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    if status not in ("Available", "On Trip", "In Shop", "Retired"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
    vehicle_repo.update(db, v, status=status)
    return VehicleResponse.model_validate(v)
