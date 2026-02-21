from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import RequireFleetManagerOrFinancial, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import (
    CostPerKmResponse,
    FuelEfficiencyResponse,
    KPIsResponse,
    VehicleROIItem,
)
from app.services.analytics_service import (
    get_cost_per_km,
    get_fuel_efficiency,
    get_kpis,
    get_vehicle_roi,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/kpis", response_model=KPIsResponse)
def get_kpis_endpoint(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManagerOrFinancial)],
):
    return KPIsResponse.model_validate(get_kpis(db))


@router.get("/vehicle-roi", response_model=list[VehicleROIItem])
def get_vehicle_roi_endpoint(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManagerOrFinancial)],
):
    return [VehicleROIItem.model_validate(r) for r in get_vehicle_roi(db)]


@router.get("/fuel-efficiency", response_model=FuelEfficiencyResponse)
def get_fuel_efficiency_endpoint(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManagerOrFinancial)],
):
    return FuelEfficiencyResponse.model_validate(get_fuel_efficiency(db))


@router.get("/cost-per-km", response_model=CostPerKmResponse)
def get_cost_per_km_endpoint(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireFleetManagerOrFinancial)],
):
    return CostPerKmResponse.model_validate(get_cost_per_km(db))
