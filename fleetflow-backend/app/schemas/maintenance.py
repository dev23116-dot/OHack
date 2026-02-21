from datetime import date as date_type
from pydantic import BaseModel

from app.schemas.common import model_config_camel


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    service_type: str
    cost: float = 0.0
    date: date_type
    notes: str = ""
    completed: bool = False


class MaintenanceUpdate(BaseModel):
    service_type: str | None = None
    cost: float | None = None
    date: date_type | None = None
    notes: str | None = None
    completed: bool | None = None


class MaintenanceResponse(BaseModel):
    model_config = model_config_camel

    id: int
    vehicle_id: int
    service_type: str
    cost: float
    date: date_type
    notes: str
    completed: bool
