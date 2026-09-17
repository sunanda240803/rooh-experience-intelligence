from typing import List, Dict, Any, Optional
from app.schemas import AIExtractionOutput, AIRelevanceResult, ConflictingInfoSchema

DEMO_EXPERIENCES_DATA = [
    {
        "id": "demo-mindfulness-hyd",
        "url": "https://example.com/events/mindfulness-hyderabad",
        "extracted": AIExtractionOutput(
            title="Mindfulness & Conscious Living Workshop",
            description="An immersive 1-day experiential workshop on modern mindfulness, stress reduction, and emotional balance designed for working professionals seeking intentional personal growth.",
            location="Hyderabad, Telangana",
            date="15 October 2026",
            start_time="09:30 AM",
            end_time="05:00 PM",
            price="₹1,500",
            currency="INR",
            category="Mindfulness",
            organizer="Mindful Living India",
            source_name="Eventbrite India",
            relevance=AIRelevanceResult(
                is_relevant=True,
                relevance_score=94,
                relevance_reason="High alignment with rooh values: practical mindfulness and stress reduction for intentional living."
            )
        ),
        "conflicting_info": [],
        "initial_status": "needs_review"
    },
    {
        "id": "demo-yoga-retreat-blr",
        "url": "https://example.com/events/yoga-retreat-bangalore",
        "extracted": AIExtractionOutput(
            title="Himalayan Yoga & Wellness Immersion Retreat",
            description="A 4-day residential retreat focusing on traditional Hatha Yoga, Pranayama, guided meditation, and holistic Ayurvedic nutrition in a serene environment.",
            location="Bangalore (Outskirts), Karnataka",
            date="12-16 November 2026",
            start_time="06:00 AM",
            end_time="07:00 PM",
            price="₹18,500",
            currency="INR",
            category="Yoga",
            organizer="Ananda Wellness Foundation",
            source_name="RetreatGuru",
            relevance=AIRelevanceResult(
                is_relevant=True,
                relevance_score=91,
                relevance_reason="Comprehensive physical and mental wellbeing program with structured practice."
            )
        ),
        "conflicting_info": [],
        "initial_status": "approved"
    },
    {
        "id": "demo-leadership-masterclass",
        "url": "https://example.com/events/personal-leadership-delhi",
        "extracted": AIExtractionOutput(
            title="Personal Leadership & Emotional Intelligence Masterclass",
            description="Interactive workshop on developing authentic self-awareness, emotional resilience, decision-making clarity, and intentional personal leadership.",
            location="New Delhi, DL",
            date="05 December 2026",
            start_time="10:00 AM",
            end_time="04:30 PM",
            price="₹4,999",
            currency="INR",
            category="Leadership",
            organizer="Growth Leadership Institute",
            source_name="Townscript",
            relevance=AIRelevanceResult(
                is_relevant=True,
                relevance_score=87,
                relevance_reason="Directly focuses on personal growth, emotional intelligence, and self-leadership."
            )
        ),
        "conflicting_info": [],
        "initial_status": "needs_review"
    },
    {
        "id": "demo-conflicting-source-case",
        "url": "https://example.com/events/holistic-breathwork-workshop",
        "extracted": AIExtractionOutput(
            title="Holistic Breathwork & Somatic Healing Session",
            description="Transformative breathwork and somatic healing session aimed at releasing tension and fostering deep mental clarity.",
            location="Bangalore, Karnataka",
            date="20 October 2026",
            start_time="04:00 PM",
            end_time="07:00 PM",
            price="₹1,500",
            currency="INR",
            category="Mental Wellness",
            organizer="Inner Space Collective",
            source_name="Multiple Sources (Cross-Referenced)",
            relevance=AIRelevanceResult(
                is_relevant=True,
                relevance_score=89,
                relevance_reason="Strong mental wellness focus with somatic healing techniques."
            )
        ),
        "conflicting_info": [
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
        ],
        "initial_status": "needs_review"
    }
]


def get_demo_template(template_id: Optional[str] = None) -> Dict[str, Any]:
    """Returns a specific demo template or the default mindfulness template."""
    if template_id:
        for t in DEMO_EXPERIENCES_DATA:
            if t["id"] == template_id:
                return t
    return DEMO_EXPERIENCES_DATA[0]
