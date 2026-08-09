"""
main.py
-------
Application entrypoint. This is the only file that:
  - instantiates the FastAPI() app object,
  - configures cross-cutting middleware (CORS),
  - registers routers,
  - triggers table creation on startup.

Everything else (validation, business logic, persistence) lives in the
layers this file simply wires together. Run with:
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routes import ticket_routes, note_routes

# Create all tables defined by models.py (via Base's metadata) if they
# don't already exist. Safe to run on every startup — SQLAlchemy skips
# tables that are already present rather than recreating them.
Base.metadata.create_all(bind=engine)

# App metadata (title/version) drives the Swagger UI at /docs and the
# ReDoc UI at /redoc, both enabled by default in FastAPI.
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# CORS: only the origins listed in settings.CORS_ORIGINS may call this
# API from a browser. Locally this is the Vite dev server; in
# production it's whatever the CORS_ORIGINS env var is set to
# (e.g. the deployed frontend's URL) — no code change needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount both routers. Each already defines its own path prefix
# (/api/tickets and /api/tickets/{ticket_id}/notes respectively), so
# no additional prefix is applied here.
app.include_router(ticket_routes.router)
app.include_router(note_routes.router)


@app.get("/", tags=["Health"])
def root():
    """
    Basic liveness/health-check endpoint. Useful for confirming the
    API is up and to sanity-check which version is deployed.
    """
    return {
        "message": "Customer Support CRM API is running",
        "version": settings.APP_VERSION,
    }
