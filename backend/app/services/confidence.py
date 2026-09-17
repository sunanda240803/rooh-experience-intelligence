from typing import List
from app.schemas import AIExtractionOutput, ValidationIssueSchema, ConfidenceDetail, ConfidenceBreakdownItem


def calculate_confidence_score(
    extracted: AIExtractionOutput,
    validation_issues: List[ValidationIssueSchema],
    fetch_success: bool = True
) -> ConfidenceDetail:
    """
    Transparent weighted confidence score algorithm out of 100.
    Calculates detailed breakdown factors and maps to High/Medium/Low categories.
    """
    breakdown: List[ConfidenceBreakdownItem] = []
    
    # 1. Title Present (+20)
    title_valid = bool(extracted.title and len(extracted.title.strip()) > 3)
    breakdown.append(
        ConfidenceBreakdownItem(
            factor="Title Identified",
            points=20 if title_valid else 0,
            max_points=20,
            passed=title_valid
        )
    )

    # 2. Description Present (+20)
    desc_valid = bool(extracted.description and len(extracted.description.strip()) > 15)
    breakdown.append(
        ConfidenceBreakdownItem(
            factor="Detailed Description",
            points=20 if desc_valid else 0,
            max_points=20,
            passed=desc_valid
        )
    )

    # 3. Location Specified (+10)
    loc_valid = bool(extracted.location and len(extracted.location.strip()) > 2)
    breakdown.append(
        ConfidenceBreakdownItem(
            factor="Location / Venue Specified",
            points=10 if loc_valid else 0,
            max_points=10,
            passed=loc_valid
        )
    )

    # 4. Date Identified (+10)
    date_valid = bool(extracted.date and len(extracted.date.strip()) > 2)
    breakdown.append(
        ConfidenceBreakdownItem(
            factor="Event Date Identified",
            points=10 if date_valid else 0,
            max_points=10,
            passed=date_valid
        )
    )

    # 5. Price Information (+10)
    price_valid = bool(extracted.price and len(extracted.price.strip()) > 0)
    breakdown.append(
        ConfidenceBreakdownItem(
            factor="Price / Fee Disclosed",
            points=10 if price_valid else 0,
            max_points=10,
            passed=price_valid
        )
    )

    # 6. Category Categorized (+10)
    cat_valid = bool(extracted.category and extracted.category != "Other")
    breakdown.append(
        ConfidenceBreakdownItem(
            factor="Category Classified",
            points=10 if cat_valid else 0,
            max_points=10,
            passed=cat_valid
        )
    )

    # 7. Source Successfully Read (+10)
    breakdown.append(
        ConfidenceBreakdownItem(
            factor="Webpage Fetch Successful",
            points=10 if fetch_success else 0,
            max_points=10,
            passed=fetch_success
        )
    )

    # 8. Low Validation Errors (+10)
    has_error_issues = any(i.severity == "error" for i in validation_issues)
    breakdown.append(
        ConfidenceBreakdownItem(
            factor="No Critical Validation Errors",
            points=10 if not has_error_issues else 0,
            max_points=10,
            passed=not has_error_issues
        )
    )

    total_score = sum(b.points for b in breakdown)

    # Assign Label based on threshold
    if total_score >= 80:
        label = "High"
    elif total_score >= 60:
        label = "Medium"
    else:
        label = "Low"

    return ConfidenceDetail(
        total_score=total_score,
        label=label,
        breakdown=breakdown
    )
