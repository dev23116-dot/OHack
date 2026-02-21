from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    model: Mapped[str] = mapped_column(String(255), default="")
    license_plate: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False, default="Truck")
    max_capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    odometer: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Available", index=True)
    region: Mapped[str] = mapped_column(String(128), default="")
    acquisition_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    trips: Mapped[list["Trip"]] = relationship("Trip", back_populates="vehicle", cascade="all, delete-orphan")
    maintenance_logs: Mapped[list["MaintenanceLog"]] = relationship(
        "MaintenanceLog", back_populates="vehicle", cascade="all, delete-orphan"
    )
    fuel_logs: Mapped[list["FuelLog"]] = relationship(
        "FuelLog", back_populates="vehicle", cascade="all, delete-orphan"
    )
