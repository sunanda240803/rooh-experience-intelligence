import os
import json
import re
from typing import Optional, Dict, Any
from openai import AsyncOpenAI
from app.schemas import AIExtractionOutput, AIRelevanceResult


SYSTEM_PROMPT = """
You are an expert AI Data Extraction Agent for rooh, a platform for intentional personal growth.
Your task is to analyze web content extracted from event/experience webpages and extract structured information.

STRICT INSTRUCTIONS:
1. NEVER invent, guess, or hallucinate missing information.
2. If a field is not explicitly supported or clearly inferable from the webpage text, return null for that field.
3. For example, if price or cost is not mentioned anywhere in the source text, set "price": null and "currency": null.
4. Extract title, description, location, date, start_time, end_time, price, currency, category, organizer, source_name.
5. Determine whether this experience is RELEVANT to personal growth (mental wellness, mindfulness, meditation, fitness, yoga, personal development, learning, career growth, relationships, creativity, spirituality, leadership).
   - If relevant: set is_relevant=true, relevance_score between 60 and 100, and provide a clear relevance_reason.
   - If irrelevant (e.g. commercial product promo, political campaign, real estate ad): set is_relevant=false, relevance_score below 50, and state why.
6. Return JSON matching the requested JSON Schema.
"""


async def extract_experience_info(
    content: str, source_url: str, source_name: Optional[str] = None
) -> AIExtractionOutput:
    """
    Extracts structured experience information using OpenAI API or smart fallback engine.
    """
    api_key = os.getenv("OPENAI_API_KEY")

    if api_key and not api_key.startswith("your_") and len(api_key.strip()) > 10:
        try:
            client = AsyncOpenAI(api_key=api_key)
            
            completion = await client.chat.completions.create(
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": f"Source URL: {source_url}\nSource Name: {source_name or 'Web Source'}\n\nWebpage Content:\n{content}",
                    },
                ],
                temperature=0.1,
            )

            response_json = json.loads(completion.choices[0].message.content or "{}")
            return parse_ai_json_response(response_json, source_name)

        except Exception as e:
            print(f"OpenAI API call failed or key invalid: {e}. Falling back to Smart Rule Extractor.")

    # Fallback Smart Rule Extractor when OpenAI API key is not configured or fails
    return fallback_smart_extraction(content, source_url, source_name)


def parse_ai_json_response(data: Dict[str, Any], default_source_name: Optional[str]) -> AIExtractionOutput:
    """Parses JSON dictionary into AIExtractionOutput pydantic model."""
    rel_data = data.get("relevance", {})
    if isinstance(rel_data, bool):
        rel_data = {
            "is_relevant": rel_data,
            "relevance_score": data.get("relevance_score", 85),
            "relevance_reason": data.get("relevance_reason", "Experience supports personal growth."),
        }

    return AIExtractionOutput(
        title=data.get("title") or None,
        description=data.get("description") or None,
        location=data.get("location") or None,
        date=data.get("date") or None,
        start_time=data.get("start_time") or None,
        end_time=data.get("end_time") or None,
        price=data.get("price") or None,
        currency=data.get("currency") or None,
        category=data.get("category") or "Personal Development",
        organizer=data.get("organizer") or None,
        source_name=data.get("source_name") or default_source_name or "Web Source",
        relevance=AIRelevanceResult(
            is_relevant=rel_data.get("is_relevant", True),
            relevance_score=int(rel_data.get("relevance_score", 85)),
            relevance_reason=rel_data.get("relevance_reason", "Focused on personal growth and self-improvement."),
        ),
    )


def fallback_smart_extraction(content: str, source_url: str, source_name: Optional[str]) -> AIExtractionOutput:
    """
    Rule-assisted heuristic extractor used when OpenAI API key is unavailable or for demo content.
    Extracts explicit fields from webpage content text without hallucinating.
    """
    lines = [l.strip() for l in content.splitlines() if l.strip()]
    title = lines[0] if lines else "Discovered Growth Experience"
    
    # Simple regex extractions
    description = "\n".join(lines[1:5]) if len(lines) > 1 else None
    
    # Date detection regex
    date_match = re.search(r"(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}|\d{1,2}/\d{1,2}/\d{4}|\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b)", content, re.IGNORECASE)
    date = date_match.group(0) if date_match else None

    # Time detection regex
    time_match = re.search(r"(\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b)", content)
    start_time = time_match.group(0) if time_match else None

    # Price detection regex
    price_match = re.search(r"(\b(?:₹|\$|USD|INR|EUR|£)\s*[\d,]+|\bFree\b)", content, re.IGNORECASE)
    price = price_match.group(0) if price_match else None

    # Location detection
    loc_match = re.search(r"(?:Location|Venue|Where):\s*([^\n]+)", content, re.IGNORECASE)
    location = loc_match.group(1).strip() if loc_match else None

    # Organizer detection
    org_match = re.search(r"(?:Hosted by|Organizer|By):\s*([^\n]+)", content, re.IGNORECASE)
    organizer = org_match.group(1).strip() if org_match else None

    # Determine category keyword heuristic
    content_lower = content.lower()
    category = "Mindfulness"
    if "yoga" in content_lower:
        category = "Yoga"
    elif "meditation" in content_lower or "mindful" in content_lower:
        category = "Mindfulness"
    elif "leadership" in content_lower or "career" in content_lower:
        category = "Leadership"
    elif "fitness" in content_lower or "health" in content_lower:
        category = "Fitness"
    elif "wellness" in content_lower:
        category = "Mental Wellness"

    is_growth_related = any(k in content_lower for k in ["mind", "growth", "wellness", "health", "workshop", "retreat", "learn", "meditation", "yoga", "leadership"])
    
    return AIExtractionOutput(
        title=title[:100] if title else None,
        description=description[:500] if description else None,
        location=location,
        date=date,
        start_time=start_time,
        end_time=None,
        price=price,
        currency="INR" if price and "₹" in price else ("USD" if price and "$" in price else None),
        category=category,
        organizer=organizer,
        source_name=source_name or "Web Source",
        relevance=AIRelevanceResult(
            is_relevant=is_growth_related,
            relevance_score=88 if is_growth_related else 35,
            relevance_reason="Contains elements of mindfulness, growth, and wellbeing." if is_growth_related else "Content does not align with rooh personal growth criteria."
        )
    )
