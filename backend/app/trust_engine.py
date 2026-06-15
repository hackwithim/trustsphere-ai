from datetime import datetime

from app.ai_anomaly import get_detector
from app.schemas import (
    Deduction,
    DeviceSignals,
    LocationSignals,
    SessionSignals,
    TransactionSignals,
)


def risk_level(score: int) -> str:
    if score >= 90:
        return "Trusted"
    if score >= 70:
        return "Low Risk"
    if score >= 50:
        return "Medium Risk"
    if score >= 30:
        return "High Risk"
    return "Critical Risk"


def adaptive_action(score: int) -> str:
    if score > 90:
        return "Allow"
    if score >= 70:
        return "Monitor"
    if score >= 50:
        return "OTP Verification"
    if score >= 30:
        return "Biometric Verification"
    return "Block Transaction"


def device_status(device: DeviceSignals) -> str:
    if device.rooted_device:
        return "Compromised"
    if device.new_device or device.unknown_browser:
        return "Suspicious"
    return "Trusted"


def location_status(location: LocationSignals) -> tuple[str, str]:
    if location.location == "Pune":
        return "Known Location", "Low"
    if location.location == "Singapore":
        return "High Risk Foreign Location", "High"
    return "New Domestic Location", "Medium"


def session_status(session: SessionSignals) -> str:
    if session.login_time <= 5 or session.login_time >= 23:
        return "Unusual Login Time"
    if session.session_duration_minutes >= 90:
        return "Extended Session"
    return "Normal Session"


def evaluate_trust(
    device: DeviceSignals,
    location: LocationSignals,
    session: SessionSignals,
    transaction: TransactionSignals | None,
) -> dict:
    deductions: list[Deduction] = []
    reasons: list[str] = []

    def add(label: str, points: int, category: str) -> None:
        deductions.append(Deduction(label=label, points=points, category=category))
        reasons.append(label)

    if device.new_device:
        add("New Device Detected", 20, "device")
    if device.rooted_device:
        add("Rooted Device Detected", 25, "device")
    if device.unknown_browser:
        add("Unknown Browser Fingerprint", 10, "device")

    location_label, location_risk = location_status(location)
    if location.location != "Pune":
        add("New Location Detected", 15, "location")
    if location.location == "Singapore":
        add("Drastic Location Change", 10, "location")

    if session.login_time <= 5 or session.login_time >= 23:
        add("Unusual Login Time", 10, "session")
    if session.session_duration_minutes >= 90:
        add("Long Session Duration", 5, "session")

    amount = transaction.amount if transaction else 0
    if transaction and transaction.amount >= 100000:
        add("High Transaction Amount", 25, "transaction")
    if transaction and transaction.new_beneficiary:
        add("New Beneficiary", 15, "transaction")

    anomaly = get_detector().evaluate(
        login_time=session.login_time,
        transaction_amount=amount,
        session_duration_minutes=session.session_duration_minutes,
    )
    if anomaly["anomaly_detected"]:
        add("Behavioral Anomaly Detected", 20, "ai")

    score = max(0, 100 - sum(item.points for item in deductions))
    level = risk_level(score)
    action = adaptive_action(score)

    return {
        "trust_score": score,
        "risk_level": level,
        "device_status": device_status(device),
        "location_status": location_label,
        "session_status": session_status(session),
        "location_risk_indicator": location_risk,
        "action": action,
        "recommended_action": action,
        "reasons": reasons or ["Known device, known location, and normal banking behavior"],
        "deductions": deductions,
        "anomaly_detected": anomaly["anomaly_detected"],
        "anomaly_score": anomaly["anomaly_score"],
        "evaluated_at": datetime.utcnow(),
    }

