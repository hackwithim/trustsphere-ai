from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str
    password: str


class UserPublic(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    primary_device: str
    known_location: str

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    token: str
    user: UserPublic


class DeviceSignals(BaseModel):
    new_device: bool = False
    rooted_device: bool = False
    unknown_browser: bool = False


class LocationSignals(BaseModel):
    location: Literal["Pune", "Mumbai", "Delhi", "Singapore"] = "Pune"


class SessionSignals(BaseModel):
    login_time: int = Field(default=10, ge=0, le=23)
    session_duration_minutes: int = Field(default=18, ge=1, le=240)


class TransactionSignals(BaseModel):
    beneficiary_name: str = "Aarav Sharma"
    amount: float = Field(default=5000, ge=1)
    new_beneficiary: bool = False


class TrustEvaluationRequest(BaseModel):
    user_id: int = 1
    device: DeviceSignals = Field(default_factory=DeviceSignals)
    location: LocationSignals = Field(default_factory=LocationSignals)
    session: SessionSignals = Field(default_factory=SessionSignals)
    transaction: TransactionSignals | None = None


class Deduction(BaseModel):
    label: str
    points: int
    category: Literal["device", "location", "session", "transaction", "ai"]


class TrendPoint(BaseModel):
    time: str
    score: int


class DistributionPoint(BaseModel):
    name: str
    value: int


class TransactionActivityPoint(BaseModel):
    time: str
    amount: float
    score: int


class AnalyticsResponse(BaseModel):
    trust_score_trend: list[TrendPoint]
    risk_distribution: list[DistributionPoint]
    transaction_activity: list[TransactionActivityPoint]


class TrustEvaluationResponse(BaseModel):
    user: UserPublic
    trust_score: int
    risk_level: str
    device_status: str
    location_status: str
    session_status: str
    location_risk_indicator: str
    action: str
    recommended_action: str
    reasons: list[str]
    deductions: list[Deduction]
    anomaly_detected: bool
    anomaly_score: float
    analytics: AnalyticsResponse
    evaluated_at: datetime

