CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(80) NOT NULL DEFAULT 'Premium Banking Customer',
  primary_device VARCHAR(160) NOT NULL DEFAULT 'iPhone 15 Pro',
  known_location VARCHAR(120) NOT NULL DEFAULT 'Pune',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trust_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  risk_level VARCHAR(80) NOT NULL,
  action VARCHAR(120) NOT NULL,
  device_status VARCHAR(80) NOT NULL,
  location_status VARCHAR(120) NOT NULL,
  session_status VARCHAR(120) NOT NULL,
  anomaly_detected BOOLEAN NOT NULL DEFAULT FALSE,
  anomaly_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  deductions JSONB NOT NULL DEFAULT '[]'::jsonb,
  transaction_amount NUMERIC(14, 2),
  beneficiary_name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_trust_events_user_id ON trust_events(user_id);
CREATE INDEX IF NOT EXISTS ix_trust_events_created_at ON trust_events(created_at);

