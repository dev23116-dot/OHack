from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import RequireSafetyOfficer, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories import driver as driver_repo
from app.schemas.driver import DriverCreate, DriverResponse, DriverUpdate

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.get("", response_model=list[DriverResponse])
def list_drivers(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireSafetyOfficer)],
):
    items = driver_repo.list_all(db)
    return [DriverResponse.model_validate(d) for d in items]


@router.get("/{driver_id}", response_model=DriverResponse)
def get_driver(
    driver_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireSafetyOfficer)],
):
    d = driver_repo.get_by_id(db, driver_id)
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    return DriverResponse.model_validate(d)


@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(
    body: DriverCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireSafetyOfficer)],
):
    d = driver_repo.create(
        db,
        name=body.name,
        license_category=body.license_category,
        license_expiry=body.license_expiry,
        status=body.status,
        trip_completion_rate=body.trip_completion_rate,
        safety_score=body.safety_score,
    )
    return DriverResponse.model_validate(d)


@router.patch("/{driver_id}", response_model=DriverResponse)
def update_driver(
    driver_id: int,
    body: DriverUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireSafetyOfficer)],
):
    d = driver_repo.get_by_id(db, driver_id)
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    driver_repo.update(db, d, **body.model_dump(exclude_unset=True))
    return DriverResponse.model_validate(d)


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(
    driver_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireSafetyOfficer)],
):
    d = driver_repo.get_by_id(db, driver_id)
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    driver_repo.delete(db, d)
