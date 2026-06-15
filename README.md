# TrustSphere AI

Continuous Identity Trust Platform for Banking.

TrustSphere AI demonstrates the concept: **Verify Continuously, Trust Intelligently.** Instead of trusting a user only at login, the app continuously scores device, location, session, transaction, and behavioral signals before deciding whether a banking transaction should be allowed, monitored, challenged, or blocked.

## What Is Included

- React.js frontend with Tailwind CSS and Recharts
- FastAPI backend
- PostgreSQL schema and seed data
- Scikit-learn Isolation Forest anomaly detector
- Dynamic trust scoring engine
- Transaction simulation module
- Device and location intelligence controls
- Explainable AI panel
- Fraud monitoring dashboard
- Docker Compose setup

## Demo Credentials

- Email: `aisha.mehta@trustbank.com`
- Password: `Trust@123`

## Run With Docker

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:5173`
- Backend API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Local Development

Start PostgreSQL first, then configure:

```bash
cp .env.example .env
```

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Trust Scoring Rules

Starting trust score: `100`

| Signal | Deduction |
| --- | ---: |
| Known device | 0 |
| New device | -20 |
| Rooted device | -25 |
| Unknown browser | -10 |
| Known location, Pune | 0 |
| New location | -15 |
| Drastic foreign location change | -10 |
| Unusual login time | -10 |
| Long session duration | -5 |
| High transaction amount | -25 |
| New beneficiary | -15 |
| AI anomaly detected | -20 |

Risk levels:

| Score | Risk Level |
| --- | --- |
| 90-100 | Trusted |
| 70-89 | Low Risk |
| 50-69 | Medium Risk |
| 30-49 | High Risk |
| 0-29 | Critical Risk |

Adaptive authentication:

| Score | Action |
| --- | --- |
| > 90 | Allow |
| 70-89 | Monitor |
| 50-69 | OTP Verification |
| 30-49 | Biometric Verification |
| < 30 | Block Transaction |

## Demo Scenarios

Use the scenario buttons in the dashboard:

- Normal Transfer: INR 5,000 to a known beneficiary. Expected action: Allow.
- Suspicious Transfer: INR 500,000 to a new beneficiary during a longer session. Expected action: OTP Verification.
- Critical Transfer: new device, unknown browser, Singapore location, unusual time, long session, INR 1,000,000 transfer. Expected action: Block Transaction.

## API Endpoints

- `POST /auth/login` validates demo credentials.
- `POST /trust/evaluate` evaluates the current device, location, session, transaction, and AI anomaly signals.
- `GET /demo-credentials` returns demo login credentials.
- `GET /health` returns service health.

## Project Structure

```text
TrustSphere/
  backend/
    app/
      ai_anomaly.py
      database.py
      main.py
      models.py
      schemas.py
      seed_data.py
      trust_engine.py
    sql/
      schema.sql
      seed.sql
    Dockerfile
    requirements.txt
  frontend/
    src/
      components/
      lib/
      App.jsx
      main.jsx
      styles.css
    Dockerfile
    package.json
  docker-compose.yml
  README.md
```
