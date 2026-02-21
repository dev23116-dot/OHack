#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
python -c "
import time, sys
try:
    import psycopg2
    for i in range(30):
        try:
            c = psycopg2.connect(
                host='db', port=5432, user='fleetflow', password='fleetflow', dbname='fleetflow'
            )
            c.close()
            break
        except Exception:
            time.sleep(1)
    else:
        sys.exit(1)
except ImportError:
    time.sleep(3)
"

echo "Running migrations..."
alembic upgrade head

echo "Seeding data..."
python -m app.db.seed

echo "Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
