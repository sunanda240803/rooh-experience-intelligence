from typing import List, Optional
from app.schemas import AIExtractionOutput, ValidationIssueSchema


def validate_extracted_experience(
    extracted: AIExtractionOutput, source_url: str, fetch_success: bool = True
) -> List[ValidationIssueSchema]:
    """
    Validation layer analyzing extracted data for completeness, validity, and potential quality issues.
    """
    issues: List[ValidationIssueSchema] = []

    # 1. Source Fetching check
    if not fetch_success:
        issues.append(
            ValidationIssueSchema(
                issue_type="source_error",
                message="Webpage could not be fetched directly. Data parsed using fallback or demo source.",
                severity="warning"
            )
        )

    # 2. Required Fields Validation
    if not extracted.title or len(extracted.title.strip()) < 3:
        issues.append(
            ValidationIssueSchema(
                issue_type="missing_title",
                message="Title is missing or too short to be descriptive.",
                severity="error"
            )
        )

    if not extracted.description or len(extracted.description.strip()) < 15:
        issues.append(
            ValidationIssueSchema(
                issue_type="missing_description",
                message="Detailed experience description was not found in the source text.",
                severity="warning"
            )
        )

    if not source_url or not (source_url.startswith("http://") or source_url.startswith("https://")):
        issues.append(
            ValidationIssueSchema(
                issue_type="invalid_url",
                message="Source URL format is invalid.",
                severity="error"
            )
        )

    # 3. Optional Fields Presence Validation
    if not extracted.location:
        issues.append(
            ValidationIssueSchema(
                issue_type="missing_location",
                message="Location / Venue information was not explicitly stated in the source.",
                severity="warning"
            )
        )

    if not extracted.date:
        issues.append(
            ValidationIssueSchema(
                issue_type="missing_date",
                message="Event date could not be confidently determined from the webpage content.",
                severity="warning"
            )
        )

    if not extracted.price:
        issues.append(
            ValidationIssueSchema(
                issue_type="missing_price",
                message="Price / Cost information was not found in the source text.",
                severity="info"
            )
        )

    if not extracted.organizer:
        issues.append(
            ValidationIssueSchema(
                issue_type="missing_organizer",
                message="Organizer or host organization was not specified.",
                severity="info"
            )
        )

    # 4. Data Format & Suspicious Value Checks
    if extracted.price and extracted.price.lower() != "free":
        # Check if price contains any digits
        import re
        if not re.search(r"\d", extracted.price):
            issues.append(
                ValidationIssueSchema(
                    issue_type="suspicious_price",
                    message=f"Price string '{extracted.price}' does not contain numeric currency values.",
                    severity="warning"
                )
            )

    # 5. Relevance Concerns
    if not extracted.relevance.is_relevant or extracted.relevance.relevance_score < 50:
        issues.append(
            ValidationIssueSchema(
                issue_type="low_relevance",
                message=f"Low relevance score ({extracted.relevance.relevance_score}%): {extracted.relevance.relevance_reason}",
                severity="warning"
            )
        )

    return issues
