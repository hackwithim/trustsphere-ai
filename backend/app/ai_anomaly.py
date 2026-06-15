from functools import lru_cache

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


SAMPLE_BANKING_DATA = np.array(
    [
        [9, 2500, 12],
        [10, 5000, 18],
        [11, 7200, 20],
        [14, 12000, 25],
        [18, 18500, 35],
        [16, 42000, 28],
        [13, 65000, 40],
        [20, 85000, 32],
        [12, 125000, 45],
        [15, 250000, 50],
        [19, 500000, 55],
        [8, 10000, 15],
        [17, 15000, 22],
        [21, 45000, 30],
        [10, 95000, 38],
        [6, 8000, 16],
        [7, 32000, 24],
        [18, 150000, 44],
        [14, 300000, 48],
        [11, 17500, 21],
    ],
    dtype=float,
)


class BehavioralAnomalyDetector:
    def __init__(self) -> None:
        self.model = make_pipeline(
            StandardScaler(),
            IsolationForest(contamination=0.12, random_state=42),
        )
        self.model.fit(SAMPLE_BANKING_DATA)

    def evaluate(
        self,
        login_time: int,
        transaction_amount: float,
        session_duration_minutes: int,
    ) -> dict:
        sample = np.array([[login_time, transaction_amount, session_duration_minutes]], dtype=float)
        prediction = int(self.model.predict(sample)[0])
        decision = float(self.model.decision_function(sample)[0])

        normalized_score = max(0.0, min(1.0, 0.5 - decision))
        domain_extreme = (
            transaction_amount >= 900000
            or session_duration_minutes >= 120
            or (transaction_amount >= 500000 and login_time <= 5)
        )
        trained_high_value_pattern = (
            transaction_amount <= 500000
            and 6 <= login_time <= 22
            and session_duration_minutes <= 100
        )

        return {
            "anomaly_detected": (
                (bool(prediction == -1 and normalized_score >= 0.18) and not trained_high_value_pattern)
                or domain_extreme
            ),
            "anomaly_score": round(normalized_score if not domain_extreme else max(normalized_score, 0.92), 2),
        }


@lru_cache
def get_detector() -> BehavioralAnomalyDetector:
    return BehavioralAnomalyDetector()
