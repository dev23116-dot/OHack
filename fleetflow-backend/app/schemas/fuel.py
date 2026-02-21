from datetime import date as date_type
from pydantic import BaseModel

from app.schemas.common import model_config_camel


class FuelLogCreate(BaseModel):
    vehicle_id: int
    trip_id: int | None = None
    liters: float
    cost: float
    odometer_reading: int | None = None
    date: date_type


class FuelLogUpdate(BaseModel):
    liters: float | None = None
    cost: float | None = None
    odometer_reading: int | None = None
    date: date_type | None = None


class FuelLogResponse(BaseModel):
    model_config = model_config_camel

    id: int
    vehicle_id: int
    trip_id: int | None = None
    liters: float
    cost: float
    odometer_reading: int | None = None
    date: date_type
