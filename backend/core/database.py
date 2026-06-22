import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.core.config import settings

# Setup logging
logger = logging.getLogger("voltiq.database")

# Enable check_same_thread=False for SQLite compatibility with FastAPI multi-threading
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        settings.database_url,
        connect_args=connect_args,
        echo=False  # Set to True for SQL log debugging
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    logger.error(f"Failed to initialize database engine: {e}")
    raise e

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session.
    Automatically closes the session after the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
