from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(80), default="Premium Banking Customer")
    primary_device: Mapped[str] = mapped_column(String(160), default="iPhone 15 Pro")
    known_location: Mapped[str] = mapped_column(String(120), default="Pune")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    events: Mapped[list["TrustEvent"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class TrustEvent(Base):
    __tablename__ = "trust_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(80), nullable=False)
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    device_status: Mapped[str] = mapped_column(String(80), nullable=False)
    location_status: Mapped[str] = mapped_column(String(120), nullable=False)
    session_status: Mapped[str] = mapped_column(String(120), nullable=False)
    anomaly_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    anomaly_score: Mapped[float] = mapped_column(Float, default=0.0)
    reasons: Mapped[list[str]] = mapped_column(JSON, default=list)
    deductions: Mapped[list[dict]] = mapped_column(JSON, default=list)
    transaction_amount: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    beneficiary_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    user: Mapped[User] = relationship(back_populates="events")

