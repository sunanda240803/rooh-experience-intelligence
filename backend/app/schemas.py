from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, HttpUrl, Field, ConfigDict


class ValidationIssueSchema(BaseModel):
    id: Optional[str] = None
    issue_type: str
    message: str
    severity: str = "warning"  # info, warning, error
    resolved: bool = False


class PossibleDuplicateSchema(BaseModel):
    id: str
    title: str
    location: Optional[str] = None
    date: Optional[str] = None
    organizer: Optional[str] = None
    similarity_score: int  # 0-100 percentage
    reason: str


class ConflictingInfoSchema(BaseModel):
    field: str
    source_a_val: str
    source_b_val: str
    message: str


class ConfidenceBreakdownItem(BaseModel):
    factor: str
    points: int
    max_points: int
    passed: bool


class ConfidenceDetail(BaseModel):
    total_score: int
    label: str  # High, Medium, Low
    breakdown: List[ConfidenceBreakdownItem]


class AIRelevanceResult(BaseModel):
    is_relevant: bool
    relevance_score: int
    relevance_reason: str


class AIExtractionOutput(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    price: Optional[str] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    organizer: Optional[str] = None
    source_name: Optional[str] = None
    relevance: AIRelevanceResult


class AnalyzeRequest(BaseModel):
    url: str
    is_demo: bool = False
    demo_template_id: Optional[str] = None


class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    price: Optional[str] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    organizer: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    status: Optional[str] = None  # needs_review, approved, rejected


class ExperienceResponse(BaseModel):
    id: str
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    price: Optional[str] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    organizer: Optional[str] = None
    source_url: str
    source_name: Optional[str] = None
    
    relevance_score: int
    relevance_reason: Optional[str] = None
    is_relevant: bool
    confidence_score: int
    confidence_label: str
    status: str
    is_demo: bool
    
    created_at: datetime
    updated_at: datetime
    
    validation_issues: List[ValidationIssueSchema] = []
    possible_duplicates: List[PossibleDuplicateSchema] = []
    conflicting_info: List[ConflictingInfoSchema] = []
    confidence_detail: Optional[ConfidenceDetail] = None

    model_config = ConfigDict(from_attributes=True)


class DashboardStats(BaseModel):
    total_discovered: int
    pending_review: int
    approved: int
    rejected: int
    low_confidence: int


class ExperienceListResponse(BaseModel):
    items: List[ExperienceResponse]
    total: int
