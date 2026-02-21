from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import RequireDispatcher, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories import trip as trip_repo
from app.schemas.trip import TripCreate, TripResponse, TripUpdate
from app.services.trip_service import (
    TripValidationError,
    create_trip,
    set_trip_completed_or_cancelled,
    set_trip_dispatched,
)

router = APIRouter(prefix="/trips", tags=["trips"])


@router.get("", response_model=list[TripResponse])
def list_trips(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireDispatcher)],
):
    items = trip_repo.list_all(db)
    return [TripResponse.model_validate(t) for t in items]


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireDispatcher)],
):
    t = trip_repo.get_by_id(db, trip_id)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return TripResponse.model_validate(t)


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip_endpoint(
    body: TripCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireDispatcher)],
):
    try:
        t = create_trip(
            db,
            vehicle_id=body.vehicle_id,
            driver_id=body.driver_id,
            cargo_weight=body.cargo_weight,
            origin=body.origin,
            destination=body.destination,
            distance=body.distance,
            revenue=body.revenue,
        )
        return TripResponse.model_validate(t)
    except TripValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: int,
    body: TripUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireDispatcher)],
):
    t = trip_repo.get_by_id(db, trip_id)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    data = body.model_dump(exclude_unset=True)
    if "status" in data:
        new_status = data.pop("status")
        if new_status == "Dispatched":
            try:
                set_trip_dispatched(db, t)
            except TripValidationError as e:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        elif new_status in ("Completed", "Cancelled"):
            set_trip_completed_or_cancelled(db, t, new_status)
        else:
            trip_repo.update(db, t, status=new_status, **data)
    else:
        trip_repo.update(db, t, **data)
    db.refresh(t)
    return TripResponse.model_validate(t)


@router.patch("/{trip_id}/status", response_model=TripResponse)
def set_trip_status(
    trip_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireDispatcher)],
    status: str = Query(..., description="Dispatched | Completed | Cancelled"),
):
    t = trip_repo.get_by_id(db, trip_id)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    if status == "Dispatched":
        try:
            set_trip_dispatched(db, t)
        except TripValidationError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    elif status in ("Completed", "Cancelled"):
        set_trip_completed_or_cancelled(db, t, status)
    else:
        trip_repo.update(db, t, status=status)
    db.refresh(t)
    return TripResponse.model_validate(t)


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireDispatcher)],
):
    t = trip_repo.get_by_id(db, trip_id)
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    trip_repo.delete(db, t)
