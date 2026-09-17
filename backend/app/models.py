import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def utc_now():
    return datetime.now(timezone.utc)


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    date = Column(String(100), nullable=True)
    start_time = Column(String(50), nullable=True)
    end_time = Column(String(50), nullable=True)
    price = Column(String(100), nullable=True)
    currency = Column(String(20), nullable=True)
    category = Column(String(100), nullable=True)
    organizer = Column(String(255), nullable=True)
    source_url = Column(String(500), nullable=False)
    source_name = Column(String(255), nullable=True)
    
    # Intelligence scores
    relevance_score = Column(Integer, default=0)
    relevance_reason = Column(Text, nullable=True)
    is_relevant = Column(Boolean, default=True)
    confidence_score = Column(Integer, default=0)
    confidence_label = Column(String(20), default="Low") # High, Medium, Low
    
    # Human Review Workflow Status
    status = Column(String(50), default="needs_review") # needs_review, approved, rejected
    is_demo = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    extraction_runs = relationship("ExtractionRun", back_populates="experience", cascade="all, delete-orphan")
    validation_issues = relationship("ValidationIssue", back_populates="experience", cascade="all, delete-orphan")


class ExtractionRun(Base):
    __tablename__ = "extraction_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    experience_id = Column(String(36), ForeignKey("experiences.id"), nullable=False)
    source_url = Column(String(500), nullable=False)
    raw_content = Column(Text, nullable=True)
    ai_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    experience = relationship("Experience", back_populates="extraction_runs")


class ValidationIssue(Base):
    __tablename__ = "validation_issues"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    experience_id = Column(String(36), ForeignKey("experiences.id"), nullable=False)
    issue_type = Column(String(100), nullable=False)
    message = Column(String(500), nullable=False)
    severity = Column(String(20), default="warning") # info, warning, error
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    experience = relationship("Experience", back_populates="validation_issues")
