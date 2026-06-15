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
        add("[SEC-DEV-10] Unrecognized Device Signature", 20, "device")
    if device.rooted_device:
        add("[SEC-DEV-12] Host OS Integrity Check Failed (Root/Jailbreak)", 25, "device")
    if device.unknown_browser:
        add("[SEC-DEV-15] Mismatched User-Agent Fingerprint", 10, "device")

    location_label, location_risk = location_status(location)
    if location.location != "Pune":
        add("[SEC-LOC-20] Unregistered Access Location", 15, "location")
    if location.location == "Singapore":
        add("[SEC-LOC-22] Velocity Threshold Exceeded (Geodistance Warning)", 10, "location")

    if session.login_time <= 5 or session.login_time >= 23:
        add("[SEC-SES-30] Out-of-Hours Session Initialized", 10, "session")
    if session.session_duration_minutes >= 90:
        add("[SEC-SES-32] Extended Idle Session Lifetime Limit Exceeded", 5, "session")

    amount = transaction.amount if transaction else 0
    if transaction and transaction.amount >= 100000:
        add("[SEC-TXN-40] Transaction Value Exceeds Normal Profile Threshold", 25, "transaction")
    if transaction and transaction.new_beneficiary:
        add("[SEC-TXN-42] First-Time Beneficiary Account", 15, "transaction")

    anomaly = get_detector().evaluate(
        login_time=session.login_time,
        transaction_amount=amount,
        session_duration_minutes=session.session_duration_minutes,
    )
    if anomaly["anomaly_detected"]:
        add("[SEC-BEH-50] Dynamic Behavioral Profile Outlier (Pattern Drift)", 20, "ai")

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
        "reasons": reasons or ["[SEC-OK-00] Session parameters aligned with baseline user profile"],
        "deductions": deductions,
        "anomaly_detected": anomaly["anomaly_detected"],
        "anomaly_score": anomaly["anomaly_score"],
        "evaluated_at": datetime.utcnow(),
    }

