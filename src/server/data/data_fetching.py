import requests
import json
import time
from pathlib import Path

BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

QUERIES = [
    {"query.cond": "diabetes", "filter.overallStatus": "RECRUITING", "filter.advanced": "AREA[Phase]PHASE3"},
    {"query.cond": "cancer", "filter.overallStatus": "RECRUITING", "filter.advanced": "AREA[Phase]PHASE2"},
    {"query.cond": "alzheimer", "filter.overallStatus": "NOT_YET_RECRUITING"},
    {"query.cond": "heart disease", "filter.overallStatus": "RECRUITING"},
    {"query.cond": "depression", "filter.overallStatus": "RECRUITING"},
    {"query.cond": "asthma", "filter.overallStatus": "ACTIVE_NOT_RECRUITING"},
    {"query.cond": "HIV", "filter.overallStatus": "RECRUITING"},
    {"query.cond": "parkinson", "filter.overallStatus": "RECRUITING"},
    {"query.cond": "lupus", "filter.overallStatus": "RECRUITING"},
    {"query.cond": "obesity", "filter.overallStatus": "RECRUITING"},
]

def fetch_studies(params: dict, page_size: int = 10) -> list[dict]:
    response = requests.get(BASE_URL, params={
        **params,
        "format": "json",
        "pageSize": page_size,
        # No 'fields' param — fetch full records and extract what you need
    })
    response.raise_for_status()
    return response.json().get("studies", [])

def extract(study: dict) -> dict:
    p = study.get("protocolSection", {})
    id_mod = p.get("identificationModule", {})
    status_mod = p.get("statusModule", {})
    desc_mod = p.get("descriptionModule", {})
    design_mod = p.get("designModule", {})
    elig_mod = p.get("eligibilityModule", {})
    contacts_mod = p.get("contactsLocationsModule", {})
    sponsor_mod = p.get("sponsorCollaboratorsModule", {})
    interventions = p.get("armsInterventionsModule", {}).get("interventions", [])
    conditions = p.get("conditionsModule", {}).get("conditions", [])
    locations = contacts_mod.get("locations", [])

    return {
        "nct_id": id_mod.get("nctId"),
        "brief_title": id_mod.get("briefTitle"),
        "official_title": id_mod.get("officialTitle"),
        "status": status_mod.get("overallStatus"),
        "start_date": status_mod.get("startDateStruct", {}).get("date"),
        "completion_date": status_mod.get("primaryCompletionDateStruct", {}).get("date"),
        "phase": design_mod.get("phases", []),
        "study_type": design_mod.get("studyType"),
        "conditions": conditions,
        "interventions": [
            {"type": i.get("type"), "name": i.get("name")}
            for i in interventions
        ],
        "brief_summary": desc_mod.get("briefSummary"),
        "eligibility": {
            "criteria": elig_mod.get("eligibilityCriteria"),
            "min_age": elig_mod.get("minimumAge"),
            "max_age": elig_mod.get("maximumAge"),
            "sex": elig_mod.get("sex"),
            "healthy_volunteers": elig_mod.get("healthyVolunteers"),
        },
        "locations": [
            {
                "facility": loc.get("facility"),
                "city": loc.get("city"),
                "state": loc.get("state"),
                "country": loc.get("country"),
                "lat": loc.get("geoPoint", {}).get("lat"),
                "lon": loc.get("geoPoint", {}).get("lon"),
            }
            for loc in locations[:5]  # cap to avoid huge payloads
        ],
        "sponsor": sponsor_mod.get("leadSponsor", {}).get("name"),
    }

def build_sample() -> list[dict]:
    all_studies = {}
    for query in QUERIES:
        try:
            studies = fetch_studies(query)
            for study in studies:
                flat = extract(study)
                if flat["nct_id"] and flat["nct_id"] not in all_studies:
                    all_studies[flat["nct_id"]] = flat
        except requests.HTTPError as e:
            print(f"Failed for {query}: {e}")
        time.sleep(0.3)
    return list(all_studies.values())

if __name__ == "__main__":
    studies = build_sample()
    Path("studies_sample.json").write_text(json.dumps(studies, indent=2))
    print(f"Collected {len(studies)} unique studies")
