from datetime import date
from sqlalchemy import Date, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    license_category: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    license_expiry: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Off Duty", index=True)
    trip_completion_rate: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    safety_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    trips: Mapped[list["Trip"]] = relationship("Trip", back_populates="driver", cascade="all, delete-orphan")
