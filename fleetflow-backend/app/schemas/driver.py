from datetime import date as date_type
from pydantic import BaseModel

from app.schemas.common import model_config_camel


class DriverCreate(BaseModel):
    name: str
    license_category: str = ""
    license_expiry: date_type
    status: str = "Off Duty"
    trip_completion_rate: int = 0
    safety_score: float = 0.0


class DriverUpdate(BaseModel):
    name: str | None = None
    license_category: str | None = None
    license_expiry: date_type | None = None
    status: str | None = None
    trip_completion_rate: int | None = None
    safety_score: float | None = None


class DriverResponse(BaseModel):
    model_config = model_config_camel

    id: int
    name: str
    license_category: str
    license_expiry: date_type
    status: str
    trip_completion_rate: int
    safety_score: float
