"""
backend/app/database.py - Database setup with SQLite / PostgreSQL compatibility
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file path (uses writable /tmp directory on Vercel serverless)
if os.getenv("VERCEL"):
    DB_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/rooh_experiences.db")
else:
    DB_URL = os.getenv("DATABASE_URL", "sqlite:///./rooh_experiences.db")

# For SQLite, enable check_same_thread=False for multi-threaded FastAPI execution
connect_args = {"check_same_thread": False} if DB_URL.startswith("sqlite") else {}

engine = create_engine(DB_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for obtaining a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
