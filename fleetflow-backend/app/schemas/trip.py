from datetime import date as date_type, datetime
from pydantic import BaseModel

from app.schemas.common import model_config_camel


class TripCreate(BaseModel):
    vehicle_id: int
    driver_id: int
    cargo_weight: int = 0
    origin: str
    destination: str
    distance: int = 0
    revenue: float = 0.0


class TripUpdate(BaseModel):
    status: str | None = None
    cargo_weight: int | None = None
    origin: str | None = None
    destination: str | None = None
    distance: int | None = None
    revenue: float | None = None


class TripResponse(BaseModel):
    model_config = model_config_camel

    id: int
    vehicle_id: int
    driver_id: int
    cargo_weight: int
    origin: str
    destination: str
    distance: int
    revenue: float
    status: str
    created_at: datetime
    completed_at: date_type | None = None
