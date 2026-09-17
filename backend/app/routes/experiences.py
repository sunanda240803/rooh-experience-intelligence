import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.database import get_db
from app.models import Experience, ExtractionRun, ValidationIssue
from app.schemas import (
    AnalyzeRequest,
    ExperienceResponse,
    ExperienceUpdate,
    DashboardStats,
    ExperienceListResponse,
    ValidationIssueSchema,
    PossibleDuplicateSchema,
    ConflictingInfoSchema,
)
from app.services.fetcher import fetch_webpage
from app.services.ai_extractor import extract_experience_info
from app.services.validator import validate_extracted_experience
from app.services.confidence import calculate_confidence_score
from app.services.deduplicator import find_possible_duplicates
from app.services.demo_data import get_demo_template, DEMO_EXPERIENCES_DATA

router = APIRouter(prefix="/api/experiences", tags=["Experiences"])


def build_experience_response(
    exp: Experience, db: Session, fetch_success: bool = True
) -> ExperienceResponse:
    """Helper method to construct a rich ExperienceResponse with all intelligence details."""
    
    # 1. Fetch DB validation issues
    val_issues_db = db.query(ValidationIssue).filter(ValidationIssue.experience_id == exp.id).all()
    val_issues_schemas = [
        ValidationIssueSchema(
            id=v.id,
            issue_type=v.issue_type,
            message=v.message,
            severity=v.severity,
            resolved=v.resolved
        ) for v in val_issues_db
    ]

    # Reconstruct extracted output for recalculating confidence breakdown
    from app.schemas import AIExtractionOutput, AIRelevanceResult
    extracted_output = AIExtractionOutput(
        title=exp.title,
        description=exp.description,
        location=exp.location,
        date=exp.date,
        start_time=exp.start_time,
        end_time=exp.end_time,
        price=exp.price,
        currency=exp.currency,
        category=exp.category,
        organizer=exp.organizer,
        source_name=exp.source_name,
        relevance=AIRelevanceResult(
            is_relevant=exp.is_relevant,
            relevance_score=exp.relevance_score,
            relevance_reason=exp.relevance_reason or ""
        )
    )

    confidence_detail = calculate_confidence_score(extracted_output, val_issues_schemas, fetch_success)
    possible_duplicates = find_possible_duplicates(db, extracted_output, current_experience_id=exp.id)

    # Check for demo conflicting info
    conflicting_info: List[ConflictingInfoSchema] = []
    if exp.id == "demo-conflicting-source-case" or "conflicting" in exp.source_url.lower():
        conflicting_info = [
            ConflictingInfoSchema(
                field="Price",
                source_a_val="₹1,500 (Early Bird on Eventbrite)",
                source_b_val="₹1,800 (Standard Ticket on Townscript)",
                message="Price discrepancy detected across cross-referenced event listings. Manual review required."
            ),
            ConflictingInfoSchema(
                field="Start Time",
                source_a_val="04:00 PM",
                source_b_val="04:30 PM",
                message="Start time varies slightly between sources."
            )
        ]

    return ExperienceResponse(
        id=exp.id,
        title=exp.title,
        description=exp.description,
        location=exp.location,
        date=exp.date,
        start_time=exp.start_time,
        end_time=exp.end_time,
        price=exp.price,
        currency=exp.currency,
        category=exp.category,
        organizer=exp.organizer,
        source_url=exp.source_url,
        source_name=exp.source_name,
        relevance_score=exp.relevance_score,
        relevance_reason=exp.relevance_reason,
        is_relevant=exp.is_relevant,
        confidence_score=exp.confidence_score,
        confidence_label=exp.confidence_label,
        status=exp.status,
        is_demo=exp.is_demo,
        created_at=exp.created_at,
        updated_at=exp.updated_at,
        validation_issues=val_issues_schemas,
        possible_duplicates=possible_duplicates,
        conflicting_info=conflicting_info,
        confidence_detail=confidence_detail
    )


@router.post("/analyze", response_model=ExperienceResponse)
async def analyze_experience(req: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Analyzes an experience URL or loads Demo experience:
    URL -> Fetch -> AI Extract -> Validate -> Confidence -> Deduplicate -> Database.
    """
    url = req.url.strip() if req.url else ""

    # Check Demo Mode trigger or preset template request
    if req.is_demo or "example.com" in url or "demo" in url or not url:
        demo_tmpl = get_demo_template(req.demo_template_id)
        extracted = demo_tmpl["extracted"]
        fetch_success = True
        raw_content = f"DEMO CONTENT for {extracted.title}"
        source_url = req.url if (req.url and "example.com" in req.url) else demo_tmpl["url"]
        is_demo_flag = True
        conflicting_list = demo_tmpl.get("conflicting_info", [])
    else:
        # Live Scraping Workflow
        fetch_res = await fetch_webpage(url)
        fetch_success = fetch_res.success
        source_url = url
        raw_content = fetch_res.content if fetch_success else ""
        is_demo_flag = False

        if fetch_success:
            extracted = await extract_experience_info(
                content=fetch_res.content,
                source_url=url,
                source_name=fetch_res.source_name
            )
        else:
            # If live fetch fails, load smart heuristic extraction with warning
            extracted = await extract_experience_info(
                content=f"Title: Experience from {url}\nDescription: Content could not be directly scraped. Webpage may require JavaScript.",
                source_url=url,
                source_name="Web Source"
            )

    # 1. Validate
    val_issues = validate_extracted_experience(extracted, source_url, fetch_success=fetch_success)

    # 2. Confidence Score
    confidence_detail = calculate_confidence_score(extracted, val_issues, fetch_success=fetch_success)

    # 3. Create Database Experience Record
    new_exp = Experience(
        title=extracted.title or "Untitled Discovered Experience",
        description=extracted.description,
        location=extracted.location,
        date=extracted.date,
        start_time=extracted.start_time,
        end_time=extracted.end_time,
        price=extracted.price,
        currency=extracted.currency,
        category=extracted.category or "Personal Growth",
        organizer=extracted.organizer,
        source_url=source_url,
        source_name=extracted.source_name or "Web Source",
        relevance_score=extracted.relevance.relevance_score,
        relevance_reason=extracted.relevance.relevance_reason,
        is_relevant=extracted.relevance.is_relevant,
        confidence_score=confidence_detail.total_score,
        confidence_label=confidence_detail.label,
        status="needs_review",  # Human review ALWAYS required!
        is_demo=is_demo_flag,
    )

    db.add(new_exp)
    db.flush()  # Generate new_exp.id

    # 4. Save Extraction Run Log
    run_log = ExtractionRun(
        experience_id=new_exp.id,
        source_url=source_url,
        raw_content=raw_content[:2000] if raw_content else "",
        ai_response=json.dumps(extracted.model_dump())
    )
    db.add(run_log)

    # 5. Save Validation Issues to DB
    for issue in val_issues:
        v_model = ValidationIssue(
            experience_id=new_exp.id,
            issue_type=issue.issue_type,
            message=issue.message,
            severity=issue.severity,
            resolved=False
        )
        db.add(v_model)

    db.commit()
    db.refresh(new_exp)

    return build_experience_response(new_exp, db, fetch_success=fetch_success)


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Returns overview count metrics for the review dashboard."""
    total = db.query(Experience).count()
    if total == 0:
        # Auto-seed demo data on first load if database is empty
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
        total = db.query(Experience).count()

    pending = db.query(Experience).filter(Experience.status == "needs_review").count()
    approved = db.query(Experience).filter(Experience.status == "approved").count()
    rejected = db.query(Experience).filter(Experience.status == "rejected").count()
    low_confidence = db.query(Experience).filter(Experience.confidence_score < 60).count()

    return DashboardStats(
        total_discovered=total,
        pending_review=pending,
        approved=approved,
        rejected=rejected,
        low_confidence=low_confidence
    )


@router.get("", response_model=ExperienceListResponse)
def list_experiences(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Lists saved experiences with search, category, and status filters."""
    query = db.query(Experience)

    if status and status.lower() != "all":
        query = query.filter(Experience.status == status.lower())

    if category and category.lower() != "all":
        query = query.filter(Experience.category.ilike(f"%{category}%"))

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Experience.title.ilike(search_term),
                Experience.description.ilike(search_term),
                Experience.location.ilike(search_term),
                Experience.organizer.ilike(search_term)
            )
        )

    total_count = query.count()
    experiences = query.order_by(Experience.created_at.desc()).offset(skip).limit(limit).all()

    items = [build_experience_response(exp, db) for exp in experiences]
    return ExperienceListResponse(items=items, total=total_count)


@router.get("/{id}", response_model=ExperienceResponse)
def get_experience_detail(id: str, db: Session = Depends(get_db)):
    """Fetches details for a single experience by ID."""
    exp = db.query(Experience).filter(Experience.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    return build_experience_response(exp, db)


@router.put("/{id}", response_model=ExperienceResponse)
def update_experience(id: str, req: ExperienceUpdate, db: Session = Depends(get_db)):
    """Updates fields of an experience record during human editing."""
    exp = db.query(Experience).filter(Experience.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    for field, value in req.model_dump(exclude_unset=True).items():
        if hasattr(exp, field):
            setattr(exp, field, value)

    # Recalculate confidence after edit
    from app.schemas import AIExtractionOutput, AIRelevanceResult
    extracted_output = AIExtractionOutput(
        title=exp.title,
        description=exp.description,
        location=exp.location,
        date=exp.date,
        start_time=exp.start_time,
        end_time=exp.end_time,
        price=exp.price,
        currency=exp.currency,
        category=exp.category,
        organizer=exp.organizer,
        source_name=exp.source_name,
        relevance=AIRelevanceResult(
            is_relevant=exp.is_relevant,
            relevance_score=exp.relevance_score,
            relevance_reason=exp.relevance_reason or ""
        )
    )

    val_issues = validate_extracted_experience(extracted_output, exp.source_url)
    conf_detail = calculate_confidence_score(extracted_output, val_issues)
    exp.confidence_score = conf_detail.total_score
    exp.confidence_label = conf_detail.label

    db.commit()
    db.refresh(exp)
    return build_experience_response(exp, db)


@router.post("/{id}/approve", response_model=ExperienceResponse)
def approve_experience(id: str, db: Session = Depends(get_db)):
    """Human approval transition: sets status = approved."""
    exp = db.query(Experience).filter(Experience.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    exp.status = "approved"
    db.commit()
    db.refresh(exp)
    return build_experience_response(exp, db)


@router.post("/{id}/reject", response_model=ExperienceResponse)
def reject_experience(id: str, db: Session = Depends(get_db)):
    """Human rejection transition: sets status = rejected."""
    exp = db.query(Experience).filter(Experience.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    exp.status = "rejected"
    db.commit()
    db.refresh(exp)
    return build_experience_response(exp, db)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(id: str, db: Session = Depends(get_db)):
    """Deletes an experience record."""
    exp = db.query(Experience).filter(Experience.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    db.delete(exp)
    db.commit()
    return None


@router.post("/seed-demo", response_model=List[ExperienceResponse])
def seed_demo_experiences(db: Session = Depends(get_db)):
    """
    Seeds sample demo experiences into database for instant out-of-the-box testing.
    """
    result = []
    for item in DEMO_EXPERIENCES_DATA:
        existing = db.query(Experience).filter(Experience.id == item["id"]).first()
        if existing:
            result.append(build_experience_response(existing, db))
            continue

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
        db.refresh(exp)
        result.append(build_experience_response(exp, db))

    return result
