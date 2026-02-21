from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import RequireFleetManager, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories import maintenance as maintenance_repo
from app.schemas.maintenance import MaintenanceCreate, MaintenanceResponse, MaintenanceUpdate
from app.services.maintenance_service import complete_maintenance, create_maintenance

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


@router.get("", response_model=list[MaintenanceResponse])
def list_maintenance(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
):
    items = maintenance_repo.list_all(db)
    return [MaintenanceResponse.model_validate(m) for m in items]


@router.get("/{log_id}", response_model=MaintenanceResponse)
def get_maintenance(
    log_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
):
    m = maintenance_repo.get_by_id(db, log_id)
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance log not found")
    return MaintenanceResponse.model_validate(m)


@router.post("", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_endpoint(
    body: MaintenanceCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
):
    m = create_maintenance(
        db,
        vehicle_id=body.vehicle_id,
        service_type=body.service_type,
        cost=body.cost,
        date=body.date,
        notes=body.notes,
        completed=body.completed,
    )
    return MaintenanceResponse.model_validate(m)


@router.patch("/{log_id}", response_model=MaintenanceResponse)
def update_maintenance(
    log_id: int,
    body: MaintenanceUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
):
    m = maintenance_repo.get_by_id(db, log_id)
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance log not found")
    if body.completed is True:
        complete_maintenance(db, m)
    else:
        maintenance_repo.update(db, m, **body.model_dump(exclude_unset=True))
    return MaintenanceResponse.model_validate(m)


@router.post("/{log_id}/complete", response_model=MaintenanceResponse)
def complete_maintenance_endpoint(
    log_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
):
    m = maintenance_repo.get_by_id(db, log_id)
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance log not found")
    m = complete_maintenance(db, m)
    return MaintenanceResponse.model_validate(m)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_maintenance(
    log_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManager)],
):
    m = maintenance_repo.get_by_id(db, log_id)
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance log not found")
    maintenance_repo.delete(db, m)
