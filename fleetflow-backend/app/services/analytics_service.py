from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.driver import Driver
from app.models.fuel import FuelLog
from app.models.maintenance import MaintenanceLog
from app.models.trip import Trip
from app.models.vehicle import Vehicle


def get_kpis(db: Session) -> dict:
    total_vehicles = db.execute(select(func.count(Vehicle.id)).where(Vehicle.status != "Retired")).scalar() or 0
    total_drivers = db.execute(select(func.count(Driver.id))).scalar() or 0
    active_fleet = db.execute(select(func.count(Vehicle.id)).where(Vehicle.status == "On Trip")).scalar() or 0
    maintenance_alerts = db.execute(select(func.count(Vehicle.id)).where(Vehicle.status == "In Shop")).scalar() or 0
    pending_cargo = db.execute(select(func.count(Trip.id)).where(Trip.status == "Draft")).scalar() or 0
    utilization_rate = (active_fleet / total_vehicles * 100.0) if total_vehicles else 0.0
    return {
        "active_fleet": active_fleet,
        "maintenance_alerts": maintenance_alerts,
        "utilization_rate": round(utilization_rate, 1),
        "pending_cargo": pending_cargo,
        "total_vehicles": total_vehicles,
        "total_drivers": total_drivers,
    }


def get_vehicle_roi(db: Session) -> list[dict]:
    vehicles = db.execute(select(Vehicle).where(Vehicle.status != "Retired")).scalars().all()
    result = []
    for v in vehicles:
        revenue = (
            db.execute(
                select(func.coalesce(func.sum(Trip.revenue), 0)).where(
                    Trip.vehicle_id == v.id, Trip.status == "Completed"
                )
            ).scalar()
            or 0
        )
        fuel_cost = (
            db.execute(
                select(func.coalesce(func.sum(FuelLog.cost), 0)).where(FuelLog.vehicle_id == v.id)
            ).scalar()
            or 0
        )
        maint_cost = (
            db.execute(
                select(func.coalesce(func.sum(MaintenanceLog.cost), 0)).where(MaintenanceLog.vehicle_id == v.id)
            ).scalar()
            or 0
        )
        costs = float(fuel_cost) + float(maint_cost)
        acq = v.acquisition_cost or 1
        roi_percent = ((float(revenue) - costs) / acq * 100) if acq else 0
        result.append({
            "vehicle_id": v.id,
            "vehicle_name": v.name,
            "revenue": float(revenue),
            "costs": costs,
            "acquisition_cost": v.acquisition_cost,
            "roi_percent": round(roi_percent, 1),
        })
    return result


def get_fuel_efficiency(db: Session) -> dict:
    total_km = (
        db.execute(
            select(func.coalesce(func.sum(Trip.distance), 0)).where(Trip.status == "Completed")
        ).scalar()
        or 0
    )
    total_liters = db.execute(select(func.coalesce(func.sum(FuelLog.liters), 0))).scalar() or 0
    total_km, total_liters = float(total_km), float(total_liters)
    efficiency = (total_km / total_liters) if total_liters else 0.0
    return {
        "total_km": total_km,
        "total_liters": total_liters,
        "fuel_efficiency_km_per_l": round(efficiency, 2),
    }


def get_cost_per_km(db: Session) -> dict:
    total_km = (
        db.execute(
            select(func.coalesce(func.sum(Trip.distance), 0)).where(Trip.status == "Completed")
        ).scalar()
        or 0
    )
    fuel_cost = db.execute(select(func.coalesce(func.sum(FuelLog.cost), 0))).scalar() or 0
    maint_cost = db.execute(select(func.coalesce(func.sum(MaintenanceLog.cost), 0))).scalar() or 0
    total_cost = float(fuel_cost) + float(maint_cost)
    total_km = float(total_km)
    cost_per_km = (total_cost / total_km) if total_km else 0.0
    return {
        "total_operational_cost": total_cost,
        "total_km": total_km,
        "cost_per_km": round(cost_per_km, 2),
    }
