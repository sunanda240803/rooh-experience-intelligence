import pytest
from app.schemas import AIExtractionOutput, AIRelevanceResult, ValidationIssueSchema
from app.services.validator import validate_extracted_experience
from app.services.confidence import calculate_confidence_score
from app.services.deduplicator import calculate_text_similarity, normalize_string


def test_url_validation_in_validator():
    """Test URL format validation in the validator layer."""
    extracted = AIExtractionOutput(
        title="Valid Experience Title",
        description="This is a valid long description for testing purposes.",
        relevance=AIRelevanceResult(is_relevant=True, relevance_score=90, relevance_reason="Relevant")
    )

    # Invalid URL test
    issues = validate_extracted_experience(extracted, source_url="not_a_valid_url")
    url_issues = [i for i in issues if i.issue_type == "invalid_url"]
    assert len(url_issues) == 1
    assert url_issues[0].severity == "error"

    # Valid URL test
    valid_issues = validate_extracted_experience(extracted, source_url="https://example.com/event")
    url_issues_valid = [i for i in valid_issues if i.issue_type == "invalid_url"]
    assert len(url_issues_valid) == 0


def test_missing_fields_detection():
    """Test that missing required and optional fields generate appropriate validation warnings."""
    extracted = AIExtractionOutput(
        title=None,
        description=None,
        location=None,
        date=None,
        price=None,
        relevance=AIRelevanceResult(is_relevant=True, relevance_score=80, relevance_reason="Growth focused")
    )

    issues = validate_extracted_experience(extracted, source_url="https://example.com/test")
    issue_types = [i.issue_type for i in issues]

    assert "missing_title" in issue_types
    assert "missing_description" in issue_types
    assert "missing_location" in issue_types
    assert "missing_date" in issue_types
    assert "missing_price" in issue_types


def test_confidence_score_calculation():
    """Test confidence scoring algorithm weights and High/Medium/Low label mapping."""
    full_extracted = AIExtractionOutput(
        title="Mindfulness Workshop",
        description="Comprehensive description of the mindfulness event.",
        location="Hyderabad",
        date="15 October 2026",
        price="₹1,500",
        category="Mindfulness",
        organizer="Mindful Org",
        relevance=AIRelevanceResult(is_relevant=True, relevance_score=95, relevance_reason="High relevance")
    )

    full_issues = validate_extracted_experience(full_extracted, "https://example.com/valid")
    conf_detail = calculate_confidence_score(full_extracted, full_issues, fetch_success=True)

    assert conf_detail.total_score >= 80
    assert conf_detail.label == "High"

    # Incomplete experience test
    partial_extracted = AIExtractionOutput(
        title="Short Event",
        description=None,
        location=None,
        date=None,
        price=None,
        relevance=AIRelevanceResult(is_relevant=True, relevance_score=70, relevance_reason="Relevant")
    )
    partial_issues = validate_extracted_experience(partial_extracted, "https://example.com/partial")
    partial_conf = calculate_confidence_score(partial_extracted, partial_issues, fetch_success=False)

    assert partial_conf.total_score < 60
    assert partial_conf.label == "Low"


def test_duplicate_text_normalization_and_similarity():
    """Test text normalization and fuzzy similarity matching for duplicate detection."""
    title1 = "Mindfulness Workshop Hyderabad 15 October 2026"
    title2 = "Mindfulness & Meditation Workshop Hyderabad 15 October 2026"

    norm1 = normalize_string(title1)
    norm2 = normalize_string(title2)

    assert "mindfulness" in norm1
    assert "meditation" in norm2

    sim_score = calculate_text_similarity(norm1, norm2)
    assert sim_score > 0.6  # High similarity expected
