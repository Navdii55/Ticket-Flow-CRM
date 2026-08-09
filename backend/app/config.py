"""
config.py
---------
Centralized application configuration. This is the ONLY file that
reads raw environment variables via os.getenv — every other module
(database.py, main.py, etc.) imports the `settings` object from here
instead of calling os.getenv/load_dotenv itself.

Rationale: configuration values (DB connection string, CORS origins,
app metadata) tend to be needed in multiple places. Reading them from
the environment in more than one file risks them drifting out of sync
or being read with different defaults. A single Settings object fixes
that at the source.
"""

import os
from dotenv import load_dotenv

# Loaded once, here, at import time. Every other module gets its
# configuration through `settings` below rather than calling
# load_dotenv()/os.getenv() itself.
load_dotenv()


class Settings:
    """
    Plain configuration holder populated from environment variables,
    each with a sane local-development default so the app still runs
    before a .env file is present.
    """

    # --- Database -------------------------------------------------
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./support_crm.db")

    # --- Application metadata (shown in Swagger docs / OpenAPI) ---
    APP_NAME: str = os.getenv("APP_NAME", "Customer Support Ticketing CRM")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")

    # --- API routing ------------------------------------------------
    API_PREFIX: str = os.getenv("API_PREFIX", "/api")

    # --- CORS ---------------------------------------------------------
    # Comma-separated list in the environment, e.g.:
    #   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
    # In production, this env var is simply replaced (e.g. with a
    # Vercel frontend URL) — no code change required. If unset, defaults
    # to the local Vite dev server origins rather than "*", so the app
    # is deployment-ready and never wide-open by accident.
    _cors_origins_raw: str = os.getenv("CORS_ORIGINS", "")
    CORS_ORIGINS: list[str] = (
        [origin.strip() for origin in _cors_origins_raw.split(",") if origin.strip()]
        if _cors_origins_raw.strip()
        else ["http://localhost:5173", "http://127.0.0.1:5173"]
    )


# Single shared instance imported throughout the app:
#   from app.config import settings
settings = Settings()
