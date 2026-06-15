from sqlalchemy.orm import Session

from app.models import TrustEvent, User


DEMO_EMAIL = "aisha.mehta@trustbank.com"
DEMO_PASSWORD = "Trust@123"


def seed_demo_data(db: Session) -> None:
    user = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if user:
        return

    user = User(
        email=DEMO_EMAIL,
        password=DEMO_PASSWORD,
        full_name="Aisha Mehta",
        role="Priority Banking Customer",
        primary_device="iPhone 15 Pro - Safari",
        known_location="Pune",
    )
    db.add(user)
    db.flush()

    seed_events = [
        (98, "Trusted", "Allow", 5000, "Aarav Sharma"),
        (96, "Trusted", "Allow", 12500, "Meera Joshi"),
        (92, "Trusted", "Allow", 42000, "Vikram Rao"),
        (88, "Low Risk", "Monitor", 85000, "Aarav Sharma"),
    ]
    for score, level, action, amount, beneficiary in seed_events:
        db.add(
            TrustEvent(
                user_id=user.id,
                score=score,
                risk_level=level,
                action=action,
                device_status="Trusted",
                location_status="Known Location",
                session_status="Normal Session",
                anomaly_detected=False,
                anomaly_score=0.08,
                reasons=["[SEC-OK-00] Session parameters aligned with baseline user profile"],
                deductions=[],
                transaction_amount=amount,
                beneficiary_name=beneficiary,
            )
        )
    db.commit()

