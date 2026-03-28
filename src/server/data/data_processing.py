"""
data_processing.py

Cleans and normalises raw studies_sample.json into a schema ready for:
  - Stage 1: hard filter matching (age, sex, status, country)
  - Stage 2: similarity search (search_text field)

Usage:
    python data_processing.py                          # reads/writes default paths
    python data_processing.py input.json output.json   # custom paths
"""

import json
import re
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Age parsing
# ---------------------------------------------------------------------------

_AGE_UNIT_YEARS = {
    "year": 1,
    "years": 1,
    "month": 1 / 12,
    "months": 1 / 12,
    "week": 1 / 52,
    "weeks": 1 / 52,
    "day": 1 / 365,
    "days": 1 / 365,
}


def parse_age(value: str | None) -> float | None:
    """Convert ClinicalTrials age strings like '18 Years' or '6 Months' to years (float)."""
    if not value:
        return None
    value = value.strip()
    m = re.match(r"^(\d+(?:\.\d+)?)\s*(\w+)$", value, re.IGNORECASE)
    if not m:
        return None
    number = float(m.group(1))
    unit = m.group(2).lower()
    multiplier = _AGE_UNIT_YEARS.get(unit)
    if multiplier is None:
        return None
    return round(number * multiplier, 2)


# ---------------------------------------------------------------------------
# Eligibility criteria splitting
# ---------------------------------------------------------------------------

def split_criteria(criteria_text: str | None) -> tuple[list[str], list[str]]:
    """
    Split free-text eligibility criteria into inclusion and exclusion lists.
    Returns (inclusion_criteria, exclusion_criteria).
    """
    if not criteria_text:
        return [], []

    inclusion: list[str] = []
    exclusion: list[str] = []
    current: list[str] = inclusion  # default to inclusion before any heading

    for line in criteria_text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue

        lower = stripped.lower()
        if re.search(r"exclusion\s+criteria", lower):
            current = exclusion
            continue
        if re.search(r"inclusion\s+criteria", lower):
            current = inclusion
            continue

        # Bullet lines: *, -, numbers followed by . or )
        if re.match(r"^[\*\-\•]\s+", stripped) or re.match(r"^\d+[\.\)]\s+", stripped):
            item = re.sub(r"^[\*\-\•\d\.\)]+\s*", "", stripped).strip()
            if item:
                current.append(item)

    return inclusion, exclusion


# ---------------------------------------------------------------------------
# Text normalisation helpers
# ---------------------------------------------------------------------------

def normalise_string(s: str) -> str:
    """Lowercase, strip punctuation noise, collapse whitespace."""
    s = s.lower()
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def normalise_list(items: list[str]) -> list[str]:
    return [normalise_string(i) for i in items if i]


# ---------------------------------------------------------------------------
# Search text builder
# ---------------------------------------------------------------------------

def build_search_text(study: dict) -> str:
    """
    Concatenate the most semantically rich fields into a single text blob
    suitable for embedding / similarity search.
    """
    parts: list[str] = []

    if study.get("brief_title"):
        parts.append(study["brief_title"])
    if study.get("official_title") and study["official_title"] != study.get("brief_title"):
        parts.append(study["official_title"])

    conditions = study.get("conditions", [])
    if conditions:
        parts.append("Conditions: " + ", ".join(conditions))

    interventions = [i.get("name", "") for i in study.get("interventions", []) if i.get("name")]
    if interventions:
        parts.append("Interventions: " + ", ".join(interventions))

    if study.get("brief_summary"):
        parts.append(study["brief_summary"])

    elig = study.get("eligibility", {})
    inclusion = elig.get("inclusion_criteria", [])
    exclusion = elig.get("exclusion_criteria", [])
    if inclusion:
        parts.append("Inclusion: " + "; ".join(inclusion))
    if exclusion:
        parts.append("Exclusion: " + "; ".join(exclusion))

    return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# Main cleaning function
# ---------------------------------------------------------------------------

def clean_study(raw: dict) -> dict:
    """
    Transform a raw extracted study (from data_fetching.py) into the
    normalised schema used by the matching pipeline.
    """
    elig_raw = raw.get("eligibility", {})
    criteria_text = elig_raw.get("criteria")
    inclusion, exclusion = split_criteria(criteria_text)

    min_age = parse_age(elig_raw.get("min_age"))
    max_age = parse_age(elig_raw.get("max_age"))

    # Sensible defaults when not specified
    if min_age is None:
        min_age = 0.0
    if max_age is None:
        max_age = 150.0

    sex_raw = (elig_raw.get("sex") or "ALL").upper()
    # Normalise various spellings
    if sex_raw in ("MALE", "M"):
        sex = "MALE"
    elif sex_raw in ("FEMALE", "F"):
        sex = "FEMALE"
    else:
        sex = "ALL"

    conditions = raw.get("conditions") or []
    locations = raw.get("locations") or []
    countries = list({loc["country"] for loc in locations if loc.get("country")})

    intervention_names = [
        i["name"].lower() for i in (raw.get("interventions") or []) if i.get("name")
    ]

    cleaned_eligibility = {
        "criteria_raw": criteria_text,
        "min_age": min_age,
        "max_age": max_age,
        "sex": sex,
        "healthy_volunteers": elig_raw.get("healthy_volunteers", False),
        "inclusion_criteria": inclusion,
        "exclusion_criteria": exclusion,
    }

    cleaned = {
        "nct_id": raw.get("nct_id"),
        "brief_title": raw.get("brief_title"),
        "official_title": raw.get("official_title"),
        "status": (raw.get("status") or "").upper(),
        "start_date": raw.get("start_date"),
        "completion_date": raw.get("completion_date"),
        "phase": raw.get("phase") or [],
        "study_type": raw.get("study_type"),
        "conditions": conditions,
        "conditions_normalized": normalise_list(conditions),
        "interventions": raw.get("interventions") or [],
        "intervention_names": intervention_names,
        "brief_summary": raw.get("brief_summary"),
        "eligibility": cleaned_eligibility,
        "locations": locations,
        "countries": countries,
        "sponsor": raw.get("sponsor"),
    }

    cleaned["search_text"] = build_search_text({**raw, "eligibility": cleaned_eligibility})

    return cleaned


# ---------------------------------------------------------------------------
# Batch processing
# ---------------------------------------------------------------------------

def process_studies(raw_studies: list[dict]) -> list[dict]:
    return [clean_study(s) for s in raw_studies]


# ---------------------------------------------------------------------------
# Filter helpers (Stage 1 of matching pipeline)
# ---------------------------------------------------------------------------

ACTIVE_STATUSES = {"RECRUITING", "NOT_YET_RECRUITING", "ACTIVE_NOT_RECRUITING", "ENROLLING_BY_INVITATION"}


def filter_candidates(
    studies: list[dict],
    patient_age: float | None = None,
    patient_sex: str | None = None,
    patient_country: str | None = None,
    active_only: bool = True,
) -> list[dict]:
    """
    Stage 1 hard-filter pass.

    Args:
        studies:          List of cleaned study dicts.
        patient_age:      Patient age in years (float). Pass None to skip age filter.
        patient_sex:      "MALE" or "FEMALE". Pass None to skip sex filter.
        patient_country:  Country name string. Pass None to skip country filter.
        active_only:      If True, only studies with an active recruitment status pass.

    Returns:
        Subset of studies that pass all supplied filters.
    """
    results = []
    for study in studies:
        elig = study.get("eligibility", {})

        if active_only and study.get("status") not in ACTIVE_STATUSES:
            continue

        if patient_age is not None:
            if patient_age < elig.get("min_age", 0):
                continue
            if patient_age > elig.get("max_age", 150):
                continue

        if patient_sex is not None:
            study_sex = elig.get("sex", "ALL")
            if study_sex != "ALL" and study_sex != patient_sex.upper():
                continue

        if patient_country is not None:
            countries = [c.lower() for c in study.get("countries", [])]
            if countries and patient_country.lower() not in countries:
                continue

        results.append(study)

    return results


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "studies_sample.json"
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).parent / "studies_cleaned.json"

    raw = json.loads(input_path.read_text())
    cleaned = process_studies(raw)
    output_path.write_text(json.dumps(cleaned, indent=2, ensure_ascii=False))
    print(f"Processed {len(cleaned)} studies -> {output_path}")
