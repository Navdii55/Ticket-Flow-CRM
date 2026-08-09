"""
database.py
------------
Central place where the database connection, session factory, and
declarative Base are configured.

Every other module that needs DB access (models.py for table definitions,
crud/ for queries, routes/ for request-scoped sessions) imports from here.
Keeping this isolated means the DB engine is configured exactly once,
and switching from SQLite to another database later only requires
changing DATABASE_URL — no other file needs to change.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# DATABASE_URL now comes from the centralized settings object in
# config.py, which itself handles load_dotenv() and the env-var read.
# database.py no longer touches os.getenv/load_dotenv directly — this
# keeps configuration reads in exactly one place across the app.
DATABASE_URL = settings.DATABASE_URL

# connect_args is SQLite-specific: by default SQLite only allows the
# thread that created a connection to use it. FastAPI can handle a
# single request across different threads, so we relax that check.
# This flag is a no-op (and harmless) for non-SQLite databases.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# SessionLocal is a factory for new Session objects. Each incoming
# HTTP request will get its own session via the get_db() dependency
# below — sessions are never shared across requests.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the declarative base class that all ORM models (models.py)
# will inherit from. SQLAlchemy uses it to collect table metadata,
# which is what Base.metadata.create_all(engine) in main.py uses to
# create the actual tables on startup.
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session for the lifetime
    of a single request, and guarantees it is closed afterward — even
    if the request raises an exception.

    Usage in routes:
        def endpoint(db: Session = Depends(get_db)):
            ...

    This is the "dependency injection" pattern required by the spec:
    routes/services never construct sessions themselves, they simply
    declare that they need one and FastAPI supplies it.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
