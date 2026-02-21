"""
Idempotent seed: creates default users and sample data if tables are empty.
Run: python -m app.db.seed
"""
from datetime import date

from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.driver import Driver
from app.models.fuel import FuelLog
from app.models.maintenance import MaintenanceLog
from app.models.trip import Trip
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle


def seed():
    db = SessionLocal()
    try:
        if db.execute(select(User).limit(1)).scalar_one_or_none():
            print("Users already exist, skipping seed.")
            return

        users = [
            User(email="admin@fleetflow.io", password_hash=get_password_hash("password"), role=UserRole.FLEET_MANAGER),
            User(email="dispatcher@fleetflow.io", password_hash=get_password_hash("password"), role=UserRole.DISPATCHER),
            User(email="safety@fleetflow.io", password_hash=get_password_hash("password"), role=UserRole.SAFETY_OFFICER),
            User(email="analyst@fleetflow.io", password_hash=get_password_hash("password"), role=UserRole.FINANCIAL_ANALYST),
        ]
        for u in users:
            db.add(u)
        db.commit()

        vehicles = [
            Vehicle(name="Volvo FH16", model="FH16 750", license_plate="FL-1001", type="Truck", max_capacity=25000, odometer=145200, status="Available", region="North", acquisition_cost=120000),
            Vehicle(name="Mercedes Actros", model="Actros 2653", license_plate="FL-1002", type="Truck", max_capacity=22000, odometer=89400, status="On Trip", region="South", acquisition_cost=115000),
            Vehicle(name="Ford Transit", model="Transit 350", license_plate="FL-2001", type="Van", max_capacity=1800, odometer=52000, status="Available", region="East", acquisition_cost=35000),
            Vehicle(name="Scania R500", model="R500 V8", license_plate="FL-1003", type="Truck", max_capacity=28000, odometer=201000, status="In Shop", region="West", acquisition_cost=135000),
            Vehicle(name="Iveco Daily", model="Daily 35S", license_plate="FL-2002", type="Van", max_capacity=1500, odometer=34500, status="Available", region="North", acquisition_cost=28000),
            Vehicle(name="Honda CB500X", model="CB500X", license_plate="FL-3001", type="Bike", max_capacity=50, odometer=12300, status="On Trip", region="East", acquisition_cost=7000),
            Vehicle(name="MAN TGX", model="TGX 18.510", license_plate="FL-1004", type="Truck", max_capacity=24000, odometer=178000, status="Retired", region="South", acquisition_cost=110000),
            Vehicle(name="Renault Master", model="Master L3H2", license_plate="FL-2003", type="Van", max_capacity=2000, odometer=67800, status="Available", region="West", acquisition_cost=32000),
        ]
        for v in vehicles:
            db.add(v)
        db.commit()

        drivers = [
            Driver(name="James Wilson", license_category="CE", license_expiry=date(2026, 8, 15), status="Available", trip_completion_rate=96, safety_score=92),
            Driver(name="Maria Santos", license_category="CE", license_expiry=date(2027, 3, 22), status="On Duty", trip_completion_rate=98, safety_score=95),
            Driver(name="Ahmed Khan", license_category="C", license_expiry=date(2025, 11, 30), status="Available", trip_completion_rate=91, safety_score=88),
            Driver(name="Sophie Laurent", license_category="B", license_expiry=date(2024, 6, 10), status="Suspended", trip_completion_rate=85, safety_score=72),
            Driver(name="Carlos Mendez", license_category="CE", license_expiry=date(2026, 12, 1), status="Off Duty", trip_completion_rate=94, safety_score=90),
            Driver(name="Elena Popov", license_category="C", license_expiry=date(2027, 5, 18), status="On Duty", trip_completion_rate=97, safety_score=93),
        ]
        for d in drivers:
            db.add(d)
        db.commit()

        v_ids = [v.id for v in db.execute(select(Vehicle).order_by(Vehicle.id)).scalars().all()]
        d_ids = [d.id for d in db.execute(select(Driver).order_by(Driver.id)).scalars().all()]

        trips = [
            Trip(vehicle_id=v_ids[1], driver_id=d_ids[1], cargo_weight=18000, origin="Hamburg", destination="Munich", distance=780, status="Dispatched", revenue=4500),
            Trip(vehicle_id=v_ids[5], driver_id=d_ids[5], cargo_weight=30, origin="Berlin", destination="Potsdam", distance=35, status="Dispatched", revenue=120),
            Trip(vehicle_id=v_ids[0], driver_id=d_ids[0], cargo_weight=20000, origin="Frankfurt", destination="Cologne", distance=190, status="Completed", revenue=2800, completed_at=date(2026, 2, 11)),
            Trip(vehicle_id=v_ids[2], driver_id=d_ids[2], cargo_weight=1200, origin="Stuttgart", destination="Nuremberg", distance=210, status="Draft", revenue=950),
            Trip(vehicle_id=v_ids[4], driver_id=d_ids[4], cargo_weight=1400, origin="Dusseldorf", destination="Dortmund", distance=70, status="Completed", revenue=600, completed_at=date(2026, 2, 6)),
        ]
        for t in trips:
            db.add(t)
        db.commit()

        t_ids = [t.id for t in db.execute(select(Trip).order_by(Trip.id)).scalars().all()]

        maintenance_logs = [
            MaintenanceLog(vehicle_id=v_ids[3], service_type="Engine Overhaul", cost=4500, date=date(2026, 2, 15), notes="Full engine rebuild required", completed=False),
            MaintenanceLog(vehicle_id=v_ids[0], service_type="Oil Change", cost=250, date=date(2026, 2, 1), notes="Routine maintenance", completed=True),
            MaintenanceLog(vehicle_id=v_ids[1], service_type="Brake Replacement", cost=1200, date=date(2026, 1, 20), notes="Front and rear brake pads", completed=True),
            MaintenanceLog(vehicle_id=v_ids[6], service_type="Tire Rotation", cost=180, date=date(2026, 1, 15), notes="All 6 tires rotated", completed=True),
        ]
        for m in maintenance_logs:
            db.add(m)
        db.commit()

        fuel_logs = [
            FuelLog(trip_id=t_ids[2], vehicle_id=v_ids[0], liters=280, cost=420, date=date(2026, 2, 11)),
            FuelLog(trip_id=t_ids[4], vehicle_id=v_ids[4], liters=18, cost=27, date=date(2026, 2, 6)),
            FuelLog(trip_id=t_ids[0], vehicle_id=v_ids[1], liters=350, cost=525, date=date(2026, 2, 18)),
        ]
        for f in fuel_logs:
            db.add(f)
        db.commit()
        print("Seed completed: users, vehicles, drivers, trips, maintenance, fuel logs.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
