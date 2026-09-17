import re
from difflib import SequenceMatcher
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Experience
from app.schemas import AIExtractionOutput, PossibleDuplicateSchema


def normalize_string(text: Optional[str]) -> str:
    """Normalizes text by lowercasing, removing punctuation, and stripping whitespace."""
    if not text:
        return ""
    # Lowercase and replace non-alphanumeric characters with spaces
    cleaned = re.sub(r"[^\w\s]", " ", text.lower())
    # Strip excess spaces
    return " ".join(cleaned.split())


def calculate_text_similarity(text1: str, text2: str) -> float:
    """Calculates SequenceMatcher ratio combined with token overlap ratio."""
    if not text1 or not text2:
        return 0.0

    seq_ratio = SequenceMatcher(None, text1, text2).ratio()
    
    tokens1 = set(text1.split())
    tokens2 = set(text2.split())
    
    if not tokens1 or not tokens2:
        token_ratio = 0.0
    else:
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        token_ratio = len(intersection) / len(union)

    # Weighted average: 60% token overlap, 40% sequence match
    return (0.6 * token_ratio) + (0.4 * seq_ratio)


def find_possible_duplicates(
    db: Session,
    extracted: AIExtractionOutput,
    current_experience_id: Optional[str] = None,
    threshold: int = 55
) -> List[PossibleDuplicateSchema]:
    """
    Scans existing DB experiences and identifies potential duplicate records.
    """
    duplicates: List[PossibleDuplicateSchema] = []

    # Get all active experiences from DB (excluding current one if updating)
    query = db.query(Experience)
    if current_experience_id:
        query = query.filter(Experience.id != current_experience_id)
    
    existing_experiences = query.all()
    if not existing_experiences:
        return duplicates

    norm_new_title = normalize_string(extracted.title)
    norm_new_loc = normalize_string(extracted.location)
    norm_new_date = normalize_string(extracted.date)
    norm_new_org = normalize_string(extracted.organizer)

    if not norm_new_title:
        return duplicates

    for exp in existing_experiences:
        norm_exp_title = normalize_string(exp.title)
        norm_exp_loc = normalize_string(exp.location)
        norm_exp_date = normalize_string(exp.date)
        norm_exp_org = normalize_string(exp.organizer)

        # 1. Compare Titles
        title_sim = calculate_text_similarity(norm_new_title, norm_exp_title)
        
        # 2. Check field overlaps
        loc_match = bool(norm_new_loc and norm_exp_loc and (norm_new_loc in norm_exp_loc or norm_exp_loc in norm_new_loc))
        date_match = bool(norm_new_date and norm_exp_date and (norm_new_date in norm_exp_date or norm_exp_date in norm_new_date))
        org_match = bool(norm_new_org and norm_exp_org and (norm_new_org in norm_exp_org or norm_exp_org in norm_new_org))

        # Overall composite score calculation
        composite_score = title_sim * 100

        reasons = []
        if title_sim > 0.6:
            reasons.append(f"Title similarity is {int(title_sim * 100)}%")
        if loc_match:
            composite_score += 15
            reasons.append("Matching location")
        if date_match:
            composite_score += 20
            reasons.append("Matching date")
        if org_match:
            composite_score += 10
            reasons.append("Matching organizer")

        final_score = min(int(composite_score), 99)

        if final_score >= threshold:
            reason_str = ", ".join(reasons) if reasons else "High string similarity"
            duplicates.append(
                PossibleDuplicateSchema(
                    id=exp.id,
                    title=exp.title or "Untitled Experience",
                    location=exp.location,
                    date=exp.date,
                    organizer=exp.organizer,
                    similarity_score=final_score,
                    reason=reason_str
                )
            )

    # Sort duplicates by similarity score descending
    duplicates.sort(key=lambda x: x.similarity_score, reverse=True)
    return duplicates[:5] # Limit top 5 match warnings
