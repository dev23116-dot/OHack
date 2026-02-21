from pydantic import BaseModel

from app.schemas.common import model_config_camel


class KPIsResponse(BaseModel):
    model_config = model_config_camel

    active_fleet: int
    maintenance_alerts: int
    utilization_rate: float
    pending_cargo: int
    total_vehicles: int
    total_drivers: int


class VehicleROIItem(BaseModel):
    model_config = model_config_camel

    vehicle_id: int
    vehicle_name: str
    revenue: float
    costs: float
    acquisition_cost: float
    roi_percent: float


class FuelEfficiencyResponse(BaseModel):
    model_config = model_config_camel

    total_km: float
    total_liters: float
    fuel_efficiency_km_per_l: float


class CostPerKmResponse(BaseModel):
    model_config = model_config_camel

    total_operational_cost: float
    total_km: float
    cost_per_km: float
