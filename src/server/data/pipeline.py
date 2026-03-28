from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path
from typing import Any

import requests

from embedder import get_embedder

_DATA_DIR = Path(__file__).parent
_RAW_PATH = _DATA_DIR / "studies_raw.json"
_FINAL_PATH = _DATA_DIR / "studies_final.json"

_BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

QUERIES = [
    {"query.cond": "diabetes",            "filter.overallStatus": "RECRUITING",           "filter.advanced": "AREA[Phase]PHASE3"},
    {"query.cond": "obesity",             "filter.overallStatus": "RECRUITING"},
    {"query.cond": "heart disease",       "filter.overallStatus": "RECRUITING"},
    {"query.cond": "hypertension",        "filter.overallStatus": "RECRUITING"},
    {"query.cond": "atrial fibrillation", "filter.overallStatus": "RECRUITING"},
    {"query.cond": "heart failure",       "filter.overallStatus": "RECRUITING"},
    {"query.cond": "stroke",              "filter.overallStatus": "RECRUITING"},
    {"query.cond": "chronic kidney disease", "filter.overallStatus": "RECRUITING"},
    {"query.cond": "cancer",              "filter.overallStatus": "RECRUITING",           "filter.advanced": "AREA[Phase]PHASE2"},
    {"query.cond": "breast cancer",       "filter.overallStatus": "RECRUITING",           "filter.advanced": "AREA[Phase]PHASE3"},
    {"query.cond": "lung cancer",         "filter.overallStatus": "RECRUITING",           "filter.advanced": "AREA[Phase]PHASE2"},
    {"query.cond": "colorectal cancer",   "filter.overallStatus": "RECRUITING"},
    {"query.cond": "leukemia",            "filter.overallStatus": "RECRUITING"},
    {"query.cond": "lymphoma",            "filter.overallStatus": "RECRUITING"},
    {"query.cond": "alzheimer",           "filter.overallStatus": "NOT_YET_RECRUITING"},
    {"query.cond": "parkinson",           "filter.overallStatus": "RECRUITING"},
    {"query.cond": "multiple sclerosis",  "filter.overallStatus": "RECRUITING"},
    {"query.cond": "epilepsy",            "filter.overallStatus": "RECRUITING"},
    {"query.cond": "depression",          "filter.overallStatus": "RECRUITING"},
    {"query.cond": "schizophrenia",       "filter.overallStatus": "RECRUITING"},
    {"query.cond": "bipolar disorder",    "filter.overallStatus": "RECRUITING"},
    {"query.cond": "ADHD",                "filter.overallStatus": "RECRUITING"},
    {"query.cond": "lupus",               "filter.overallStatus": "RECRUITING"},
    {"query.cond": "rheumatoid arthritis","filter.overallStatus": "RECRUITING"},
    {"query.cond": "asthma",              "filter.overallStatus": "ACTIVE_NOT_RECRUITING"},
    {"query.cond": "COPD",                "filter.overallStatus": "RECRUITING"},
    {"query.cond": "Crohn's disease",     "filter.overallStatus": "RECRUITING"},
    {"query.cond": "psoriasis",           "filter.overallStatus": "RECRUITING"},
    {"query.cond": "HIV",                 "filter.overallStatus": "RECRUITING"},
    {"query.cond": "hepatitis C",         "filter.overallStatus": "RECRUITING"},
    {"query.cond": "osteoporosis",        "filter.overallStatus": "RECRUITING"},
]

ACTIVE_STATUSES = {"RECRUITING", "NOT_YET_RECRUITING", "ACTIVE_NOT_RECRUITING", "ENROLLING_BY_INVITATION"}

_AGE_UNIT_YEARS = {
    "year": 1, "years": 1,
    "month": 1 / 12, "months": 1 / 12,
    "week": 1 / 52, "weeks": 1 / 52,
    "day": 1 / 365, "days": 1 / 365,
}


def _fetch_page(params: dict, page_size: int = 10) -> list[dict]:
    r = requests.get(_BASE_URL, params={**params, "format": "json", "pageSize": page_size})
    r.raise_for_status()
    return r.json().get("studies", [])


def _extract(study: dict) -> dict:
    p = study.get("protocolSection", {})
    id_mod       = p.get("identificationModule", {})
    status_mod   = p.get("statusModule", {})
    desc_mod     = p.get("descriptionModule", {})
    design_mod   = p.get("designModule", {})
    elig_mod     = p.get("eligibilityModule", {})
    contacts_mod = p.get("contactsLocationsModule", {})
    sponsor_mod  = p.get("sponsorCollaboratorsModule", {})
    interventions = p.get("armsInterventionsModule", {}).get("interventions", [])
    conditions    = p.get("conditionsModule", {}).get("conditions", [])
    locations     = contacts_mod.get("locations", [])

    return {
        "nct_id":          id_mod.get("nctId"),
        "brief_title":     id_mod.get("briefTitle"),
        "official_title":  id_mod.get("officialTitle"),
        "status":          status_mod.get("overallStatus"),
        "start_date":      status_mod.get("startDateStruct", {}).get("date"),
        "completion_date": status_mod.get("primaryCompletionDateStruct", {}).get("date"),
        "phase":           design_mod.get("phases", []),
        "study_type":      design_mod.get("studyType"),
        "conditions":      conditions,
        "interventions":   [{"type": i.get("type"), "name": i.get("name")} for i in interventions],
        "brief_summary":   desc_mod.get("briefSummary"),
        "eligibility": {
            "criteria":           elig_mod.get("eligibilityCriteria"),
            "min_age":            elig_mod.get("minimumAge"),
            "max_age":            elig_mod.get("maximumAge"),
            "sex":                elig_mod.get("sex"),
            "healthy_volunteers": elig_mod.get("healthyVolunteers"),
        },
        "locations": [
            {
                "facility": loc.get("facility"),
                "city":     loc.get("city"),
                "state":    loc.get("state"),
                "country":  loc.get("country"),
                "lat":      loc.get("geoPoint", {}).get("lat"),
                "lon":      loc.get("geoPoint", {}).get("lon"),
            }
            for loc in locations[:5]
        ],
        "sponsor": sponsor_mod.get("leadSponsor", {}).get("name"),
    }


def _fetch_all() -> list[dict]:
    seen: dict[str, dict] = {}
    for query in QUERIES:
        try:
            for study in _fetch_page(query):
                flat = _extract(study)
                if flat["nct_id"] and flat["nct_id"] not in seen:
                    seen[flat["nct_id"]] = flat
        except requests.HTTPError:
            pass
        time.sleep(0.3)
    return list(seen.values())


def _parse_age(value: str | None) -> float | None:
    if not value:
        return None
    m = re.match(r"^(\d+(?:\.\d+)?)\s*(\w+)$", value.strip(), re.IGNORECASE)
    if not m:
        return None
    multiplier = _AGE_UNIT_YEARS.get(m.group(2).lower())
    return round(float(m.group(1)) * multiplier, 2) if multiplier else None


def _split_criteria(text: str | None) -> tuple[list[str], list[str]]:
    if not text:
        return [], []
    inclusion, exclusion, current = [], [], []
    current = inclusion
    for line in text.splitlines():
        s = line.strip()
        if not s:
            continue
        if re.search(r"exclusion\s+criteria", s, re.IGNORECASE):
            current = exclusion
            continue
        if re.search(r"inclusion\s+criteria", s, re.IGNORECASE):
            current = inclusion
            continue
        if re.match(r"^[\*\-\•]\s+", s) or re.match(r"^\d+[\.\)]\s+", s):
            item = re.sub(r"^[\*\-\•\d\.\)]+\s*", "", s).strip()
            if item:
                current.append(item)
    return inclusion, exclusion


def _normalise(s: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", " ", s.lower())).strip()


def _build_search_text(study: dict, inclusion: list[str], exclusion: list[str]) -> str:
    parts = []
    if study.get("brief_title"):
        parts.append(study["brief_title"])
    if study.get("official_title") and study["official_title"] != study.get("brief_title"):
        parts.append(study["official_title"])
    if study.get("conditions"):
        parts.append("Conditions: " + ", ".join(study["conditions"]))
    intervention_names = [i.get("name") for i in study.get("interventions", []) if i.get("name")]
    if intervention_names:
        parts.append("Interventions: " + ", ".join(intervention_names))
    if study.get("brief_summary"):
        parts.append(study["brief_summary"])
    if inclusion:
        parts.append("Inclusion criteria: " + "; ".join(inclusion))
    if exclusion:
        parts.append("Exclusion criteria: " + "; ".join(exclusion))
    return "\n\n".join(parts)


def _build_study_summary(
    study: dict,
    min_age: float,
    max_age: float,
    sex: str,
    inclusion: list[str],
    exclusion: list[str],
    countries: list[str],
) -> str:
    sentences = []

    phases = [p.replace("PHASE", "Phase ") for p in (study.get("phase") or [])]
    phase_str = "/".join(phases) if phases else ""
    study_type = (study.get("study_type") or "").replace("_", " ").title()
    conditions = study.get("conditions") or []
    condition_str = ", ".join(conditions) if conditions else "an unspecified condition"

    population = {"MALE": "male participants", "FEMALE": "female participants"}.get(sex, "participants")

    if min_age > 0 and max_age < 150:
        age_str = f" aged {int(min_age)}–{int(max_age)}"
    elif min_age > 0:
        age_str = f" aged {int(min_age)} and older"
    elif max_age < 150:
        age_str = f" up to age {int(max_age)}"
    else:
        age_str = ""

    sentences.append(
        f"This {(' '.join(filter(None, [phase_str, study_type]))).strip()} trial is recruiting "
        f"{population}{age_str} with {condition_str}."
    )

    interventions = study.get("interventions") or []
    drug_names = [i["name"] for i in interventions if i.get("type") == "DRUG" and i.get("name")]
    other_names = [i["name"] for i in interventions if i.get("type") != "DRUG" and i.get("name")]
    if drug_names:
        sentences.append(f"The study evaluates {', '.join(drug_names)}.")
    elif other_names:
        sentences.append(f"The intervention involves {', '.join(other_names)}.")

    brief = (study.get("brief_summary") or "").strip()
    if brief:
        first = re.split(r"(?<=[.!?])\s", brief)[0].strip()
        if len(first) > 20:
            sentences.append(first)

    if inclusion:
        sentences.append(f"Eligible participants must meet: {'; '.join(inclusion[:3])}.")
    if exclusion:
        sentences.append(f"Patients are excluded if they have: {'; '.join(exclusion[:3])}.")
    if countries:
        sentences.append(f"The trial is conducted in {', '.join(countries)}.")

    return " ".join(sentences)


def _clean(raw: dict) -> dict:
    elig_raw = raw.get("eligibility", {})
    inclusion, exclusion = _split_criteria(elig_raw.get("criteria"))

    min_age = _parse_age(elig_raw.get("min_age")) or 0.0
    max_age = _parse_age(elig_raw.get("max_age")) or 150.0

    sex_raw = (elig_raw.get("sex") or "ALL").upper()
    sex = "MALE" if sex_raw in ("MALE", "M") else "FEMALE" if sex_raw in ("FEMALE", "F") else "ALL"

    conditions = raw.get("conditions") or []
    locations  = raw.get("locations") or []
    countries  = list({loc["country"] for loc in locations if loc.get("country")})

    return {
        "nct_id":                raw.get("nct_id"),
        "brief_title":           raw.get("brief_title"),
        "official_title":        raw.get("official_title"),
        "status":                (raw.get("status") or "").upper(),
        "start_date":            raw.get("start_date"),
        "completion_date":       raw.get("completion_date"),
        "phase":                 raw.get("phase") or [],
        "study_type":            raw.get("study_type"),
        "conditions":            conditions,
        "conditions_normalized": [_normalise(c) for c in conditions if c],
        "interventions":         raw.get("interventions") or [],
        "intervention_names":    [i["name"].lower() for i in (raw.get("interventions") or []) if i.get("name")],
        "brief_summary":         raw.get("brief_summary"),
        "eligibility": {
            "criteria_raw":       elig_raw.get("criteria"),
            "min_age":            min_age,
            "max_age":            max_age,
            "sex":                sex,
            "healthy_volunteers": elig_raw.get("healthy_volunteers", False),
            "inclusion_criteria": inclusion,
            "exclusion_criteria": exclusion,
        },
        "locations":    locations,
        "countries":    countries,
        "sponsor":      raw.get("sponsor"),
        "search_text":  _build_search_text(raw, inclusion, exclusion),
        "study_summary": _build_study_summary(raw, min_age, max_age, sex, inclusion, exclusion, countries),
    }


def filter_candidates(
    studies: list[dict],
    patient_age: float | None = None,
    patient_sex: str | None = None,
    active_only: bool = True,
) -> list[dict]:
    results = []
    for study in studies:
        elig = study.get("eligibility", {})
        if active_only and study.get("status") not in ACTIVE_STATUSES:
            continue
        if patient_age is not None:
            if patient_age < elig.get("min_age", 0) or patient_age > elig.get("max_age", 150):
                continue
        if patient_sex is not None:
            study_sex = elig.get("sex", "ALL")
            if study_sex != "ALL" and study_sex != patient_sex.upper():
                continue
        results.append(study)
    return results


def build_pipeline(
    skip_fetch: bool = False,
    embedding_provider: str = "local",
    to_save: bool = False,
) -> list[dict[str, Any]]:
    if skip_fetch:
        raw_studies = json.loads(_RAW_PATH.read_text())
    else:
        raw_studies = _fetch_all()
        if to_save:
            _RAW_PATH.write_text(json.dumps(raw_studies, indent=2, ensure_ascii=False))

    studies = [_clean(s) for s in raw_studies]

    embedder = get_embedder(embedding_provider)
    texts = [s["study_summary"] for s in studies]
    embeddings = embedder.embed(texts)
    for study, embedding in zip(studies, embeddings):
        study["embedding"] = embedding

    if to_save:
        _FINAL_PATH.write_text(json.dumps(studies, indent=2, ensure_ascii=False))

    return studies


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-fetch", action="store_true")
    parser.add_argument("--provider", default="local", choices=["local", "openai"])
    args = parser.parse_args()
    build_pipeline(skip_fetch=args.skip_fetch, embedding_provider=args.provider, to_save=True)
