INSERT INTO users (
  email,
  password,
  full_name,
  role,
  primary_device,
  known_location
)
VALUES (
  'aisha.mehta@trustbank.com',
  'Trust@123',
  'Aisha Mehta',
  'Priority Banking Customer',
  'iPhone 15 Pro - Safari',
  'Pune'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO trust_events (
  user_id,
  score,
  risk_level,
  action,
  device_status,
  location_status,
  session_status,
  anomaly_detected,
  anomaly_score,
  reasons,
  deductions,
  transaction_amount,
  beneficiary_name
)
SELECT
  users.id,
  seed.score,
  seed.risk_level,
  seed.action,
  'Trusted',
  'Known Location',
  'Normal Session',
  FALSE,
  0.08,
  '["Known device, known location, and normal banking behavior"]'::jsonb,
  '[]'::jsonb,
  seed.amount,
  seed.beneficiary
FROM users
CROSS JOIN (
  VALUES
    (98, 'Trusted', 'Allow', 5000.00, 'Aarav Sharma'),
    (96, 'Trusted', 'Allow', 12500.00, 'Meera Joshi'),
    (92, 'Trusted', 'Allow', 42000.00, 'Vikram Rao'),
    (88, 'Low Risk', 'Monitor', 85000.00, 'Aarav Sharma')
) AS seed(score, risk_level, action, amount, beneficiary)
WHERE users.email = 'aisha.mehta@trustbank.com'
  AND NOT EXISTS (
    SELECT 1
    FROM trust_events
    WHERE trust_events.user_id = users.id
  );

