# FleetFlow Backend

Production-ready FastAPI backend for FleetFlow: PostgreSQL, SQLAlchemy 2.0, JWT auth, RBAC, analytics, and report generation (CSV/PDF).

## Tech stack

- Python 3.11+, FastAPI, PostgreSQL, SQLAlchemy 2.0, Alembic, Pydantic v2
- JWT (python-jose), Passlib (bcrypt), Uvicorn
- Pandas (CSV reports), ReportLab (PDF reports)
- Docker, Docker Compose

## Run with Docker

From the `fleetflow-backend` directory:

```bash
docker-compose up --build
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

Database runs migrations and seed on startup. Seed users (password: `password`):

- `admin@fleetflow.io` — Fleet Manager  
- `dispatcher@fleetflow.io` — Dispatcher  
- `safety@fleetflow.io` — Safety Officer  
- `analyst@fleetflow.io` — Financial Analyst  

## Run locally (no Docker)

1. Create a PostgreSQL database and set `DATABASE_URL` in `.env`.
2. From project root:

```bash
cd fleetflow-backend
pip install -r requirements.txt
alembic upgrade head
python -m app.db.seed
uvicorn app.main:app --reload --port 8000
```

## API overview

- **Auth:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- **Vehicles:** CRUD + `PATCH /api/v1/vehicles/{id}/status` (Fleet Manager)
- **Drivers:** CRUD (Safety Officer)
- **Trips:** CRUD + `PATCH /api/v1/trips/{id}/status` (Dispatcher)
- **Maintenance:** CRUD + `POST /api/v1/maintenance/{id}/complete` (Fleet Manager)
- **Fuel:** CRUD (Financial Analyst)
- **Analytics:** `GET /api/v1/analytics/kpis`, `/vehicle-roi`, `/fuel-efficiency`, `/cost-per-km` (Fleet Manager, Financial Analyst)
- **Reports:** `GET /api/v1/reports/financial-summary?format=csv|pdf` (Fleet Manager, Financial Analyst)

All protected routes require `Authorization: Bearer <token>`.

## Frontend

Set `VITE_API_URL=http://localhost:8000` (or your backend URL) when running the Vite app. Login and Export Report (Analytics) call the backend.
