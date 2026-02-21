import os
from pathlib import Path

def _env(key: str, default: str = "") -> str:
    return os.environ.get(key, default).strip()

class Settings:
    PROJECT_NAME: str = "FleetFlow API"
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str = _env("DATABASE_URL", "postgresql+psycopg2://fleetflow:fleetflow@localhost:5432/fleetflow")
    JWT_SECRET_KEY: str = _env("JWT_SECRET_KEY", "change-me-in-production")
    JWT_ALGORITHM: str = _env("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(_env("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    BACKEND_CORS_ORIGINS: list[str] = [
        x.strip() for x in _env("BACKEND_CORS_ORIGINS", "http://localhost:5173").split(",") if x.strip()
    ]

settings = Settings()
