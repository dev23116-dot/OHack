"""Initial schema: users, vehicles, drivers, trips, maintenance_logs, fuel_logs

Revision ID: 001
Revises:
Create Date: 2026-02-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    userrole = sa.Enum("fleet_manager", "dispatcher", "safety_officer", "financial_analyst", name="userrole")
    userrole.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", userrole, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id", "users", ["id"], unique=False)

    op.create_table(
        "vehicles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("model", sa.String(255), nullable=True),
        sa.Column("license_plate", sa.String(64), nullable=False),
        sa.Column("type", sa.String(32), nullable=False),
        sa.Column("max_capacity", sa.Integer(), nullable=False),
        sa.Column("odometer", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("region", sa.String(128), nullable=True),
        sa.Column("acquisition_cost", sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vehicles_id", "vehicles", ["id"], unique=False)
    op.create_index("ix_vehicles_license_plate", "vehicles", ["license_plate"], unique=True)
    op.create_index("ix_vehicles_status", "vehicles", ["status"], unique=False)

    op.create_table(
        "drivers",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("license_category", sa.String(32), nullable=False),
        sa.Column("license_expiry", sa.Date(), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("trip_completion_rate", sa.Integer(), nullable=False),
        sa.Column("safety_score", sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_drivers_id", "drivers", ["id"], unique=False)
    op.create_index("ix_drivers_status", "drivers", ["status"], unique=False)

    op.create_table(
        "trips",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("vehicle_id", sa.Integer(), nullable=False),
        sa.Column("driver_id", sa.Integer(), nullable=False),
        sa.Column("cargo_weight", sa.Integer(), nullable=False),
        sa.Column("origin", sa.String(255), nullable=False),
        sa.Column("destination", sa.String(255), nullable=False),
        sa.Column("distance", sa.Integer(), nullable=False),
        sa.Column("revenue", sa.Float(), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(["driver_id"], ["drivers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_trips_driver_id", "trips", ["driver_id"], unique=False)
    op.create_index("ix_trips_id", "trips", ["id"], unique=False)
    op.create_index("ix_trips_status", "trips", ["status"], unique=False)
    op.create_index("ix_trips_vehicle_id", "trips", ["vehicle_id"], unique=False)

    op.create_table(
        "maintenance_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("vehicle_id", sa.Integer(), nullable=False),
        sa.Column("service_type", sa.String(255), nullable=False),
        sa.Column("cost", sa.Float(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("notes", sa.String(1024), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_maintenance_logs_id", "maintenance_logs", ["id"], unique=False)
    op.create_index("ix_maintenance_logs_vehicle_id", "maintenance_logs", ["vehicle_id"], unique=False)

    op.create_table(
        "fuel_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("vehicle_id", sa.Integer(), nullable=False),
        sa.Column("trip_id", sa.Integer(), nullable=True),
        sa.Column("liters", sa.Float(), nullable=False),
        sa.Column("cost", sa.Float(), nullable=False),
        sa.Column("odometer_reading", sa.Integer(), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["trip_id"], ["trips.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_fuel_logs_id", "fuel_logs", ["id"], unique=False)
    op.create_index("ix_fuel_logs_trip_id", "fuel_logs", ["trip_id"], unique=False)
    op.create_index("ix_fuel_logs_vehicle_id", "fuel_logs", ["vehicle_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_fuel_logs_vehicle_id", table_name="fuel_logs")
    op.drop_index("ix_fuel_logs_trip_id", table_name="fuel_logs")
    op.drop_index("ix_fuel_logs_id", table_name="fuel_logs")
    op.drop_table("fuel_logs")
    op.drop_index("ix_maintenance_logs_vehicle_id", table_name="maintenance_logs")
    op.drop_index("ix_maintenance_logs_id", table_name="maintenance_logs")
    op.drop_table("maintenance_logs")
    op.drop_index("ix_trips_vehicle_id", table_name="trips")
    op.drop_index("ix_trips_status", table_name="trips")
    op.drop_index("ix_trips_id", table_name="trips")
    op.drop_index("ix_trips_driver_id", table_name="trips")
    op.drop_table("trips")
    op.drop_index("ix_drivers_status", table_name="drivers")
    op.drop_index("ix_drivers_id", table_name="drivers")
    op.drop_table("drivers")
    op.drop_index("ix_vehicles_status", table_name="vehicles")
    op.drop_index("ix_vehicles_license_plate", table_name="vehicles")
    op.drop_index("ix_vehicles_id", table_name="vehicles")
    op.drop_table("vehicles")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS userrole")
