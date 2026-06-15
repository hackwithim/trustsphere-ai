from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import datetime
from os import getenv

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db, init_db
from app.models import TrustEvent, User
from app.schemas import (
    AnalyticsResponse,
    LoginRequest,
    LoginResponse,
    TransactionActivityPoint,
    TrendPoint,
    TrustEvaluationRequest,
    TrustEvaluationResponse,
    UserPublic,
)
from app.seed_data import DEMO_EMAIL, DEMO_PASSWORD, seed_demo_data
from app.trust_engine import evaluate_trust


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="TrustSphere AI API",
    description="Continuous identity trust scoring prototype for banking.",
    version="0.1.0",
    lifespan=lifespan,
)

allowed_origins = getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "trustsphere-ai"}


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or user.password != payload.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid demo credentials",
        )

    return LoginResponse(token=f"demo-token-{user.id}", user=UserPublic.model_validate(user))


@app.get("/demo-credentials")
def demo_credentials() -> dict:
    return {"email": DEMO_EMAIL, "password": DEMO_PASSWORD}


def build_analytics(db: Session, user_id: int, latest: dict) -> AnalyticsResponse:
    events = (
        db.query(TrustEvent)
        .filter(TrustEvent.user_id == user_id)
        .order_by(TrustEvent.created_at.desc())
        .limit(10)
        .all()
    )
    ordered_events = list(reversed(events))

    trend = [
        TrendPoint(time=event.created_at.strftime("%H:%M"), score=event.score)
        for event in ordered_events
    ]
    if not trend or trend[-1].score != latest["trust_score"]:
        trend.append(TrendPoint(time=datetime.utcnow().strftime("%H:%M"), score=latest["trust_score"]))

    buckets = defaultdict(int)
    for deduction in latest["deductions"]:
        buckets[deduction.category] += deduction.points

    distribution = [
        {"name": "Device", "value": buckets["device"]},
        {"name": "Location", "value": buckets["location"]},
        {"name": "Session", "value": buckets["session"]},
        {"name": "Transaction", "value": buckets["transaction"]},
        {"name": "AI", "value": buckets["ai"]},
    ]
    if sum(item["value"] for item in distribution) == 0:
        distribution = [{"name": "Trusted Baseline", "value": 100}]

    transaction_activity = [
        TransactionActivityPoint(
            time=event.created_at.strftime("%H:%M"),
            amount=float(event.transaction_amount or 0),
            score=event.score,
        )
        for event in ordered_events
        if event.transaction_amount is not None
    ]

    return AnalyticsResponse(
        trust_score_trend=trend[-10:],
        risk_distribution=distribution,
        transaction_activity=transaction_activity[-8:],
    )


@app.post("/trust/evaluate", response_model=TrustEvaluationResponse)
def evaluate(payload: TrustEvaluationRequest, db: Session = Depends(get_db)) -> TrustEvaluationResponse:
    user = db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = evaluate_trust(
        device=payload.device,
        location=payload.location,
        session=payload.session,
        transaction=payload.transaction,
    )

    event = TrustEvent(
        user_id=user.id,
        score=result["trust_score"],
        risk_level=result["risk_level"],
        action=result["action"],
        device_status=result["device_status"],
        location_status=result["location_status"],
        session_status=result["session_status"],
        anomaly_detected=result["anomaly_detected"],
        anomaly_score=result["anomaly_score"],
        reasons=result["reasons"],
        deductions=[deduction.model_dump() for deduction in result["deductions"]],
        transaction_amount=payload.transaction.amount if payload.transaction else None,
        beneficiary_name=payload.transaction.beneficiary_name if payload.transaction else None,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    analytics = build_analytics(db, user.id, result)

    return TrustEvaluationResponse(
        user=UserPublic.model_validate(user),
        analytics=analytics,
        **result,
    )

