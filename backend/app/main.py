import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.database import engine, Base, SessionLocal
from app.routes import experiences
from app.services.demo_data import DEMO_EXPERIENCES_DATA
from app.models import Experience, ValidationIssue
from app.services.validator import validate_extracted_experience


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for creating database tables and seeding demo data on startup."""
    # Create SQLite database tables if they do not exist
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed demo experiences if DB is empty
    db = SessionLocal()
    try:
        count = db.query(Experience).count()
        if count == 0:
            for item in DEMO_EXPERIENCES_DATA:
                extracted = item["extracted"]
                exp = Experience(
                    id=item["id"],
                    title=extracted.title,
                    description=extracted.description,
                    location=extracted.location,
                    date=extracted.date,
                    start_time=extracted.start_time,
                    end_time=extracted.end_time,
                    price=extracted.price,
                    currency=extracted.currency,
                    category=extracted.category,
                    organizer=extracted.organizer,
                    source_url=item["url"],
                    source_name=extracted.source_name,
                    relevance_score=extracted.relevance.relevance_score,
                    relevance_reason=extracted.relevance.relevance_reason,
                    is_relevant=extracted.relevance.is_relevant,
                    confidence_score=93 if item["id"] != "demo-conflicting-source-case" else 72,
                    confidence_label="High" if item["id"] != "demo-conflicting-source-case" else "Medium",
                    status=item["initial_status"],
                    is_demo=True
                )
                db.add(exp)
                db.flush()

                val_issues = validate_extracted_experience(extracted, item["url"])
                for issue in val_issues:
                    v_model = ValidationIssue(
                        experience_id=exp.id,
                        issue_type=issue.issue_type,
                        message=issue.message,
                        severity=issue.severity,
                        resolved=False
                    )
                    db.add(v_model)
            db.commit()
    finally:
        db.close()

    yield


app = FastAPI(
    title="Rooh Experience Intelligence API",
    description="Backend API for intentional personal growth experience extraction, AI structuring, validation, and curation.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local POC development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router
app.include_router(experiences.router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Rooh Experience Intelligence",
        "version": "1.0.0",
        "docs": "/docs"
    }
