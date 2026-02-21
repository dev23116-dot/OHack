from pydantic import BaseModel, Field

from app.schemas.common import model_config_camel

VEHICLE_STATUSES = {"Available", "On Trip", "In Shop", "Retired"}
VEHICLE_TYPES = {"Truck", "Van", "Bike"}


class VehicleCreate(BaseModel):
    name: str
    model: str = ""
    license_plate: str
    type: str = "Truck"
    max_capacity: int = 0
    odometer: int = 0
    status: str = "Available"
    region: str = ""
    acquisition_cost: float = 0.0


class VehicleUpdate(BaseModel):
    name: str | None = None
    model: str | None = None
    license_plate: str | None = None
    type: str | None = None
    max_capacity: int | None = None
    odometer: int | None = None
    status: str | None = None
    region: str | None = None
    acquisition_cost: float | None = None


class VehicleResponse(BaseModel):
    model_config = model_config_camel

    id: int
    name: str
    model: str
    license_plate: str
    type: str
    max_capacity: int
    odometer: int
    status: str
    region: str
    acquisition_cost: float
