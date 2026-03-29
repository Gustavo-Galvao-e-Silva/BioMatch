"""
Reads studies_final.json and upserts all studies into the research_studies table.

Usage:
    cd src/backend
    python data/seed_db.py                     # uses studies_final.json
    python data/seed_db.py path/to/file.json   # custom path
"""
from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

# Allow running from src/backend directly
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.database import SessionLocal, engine, Base
from app.models import ResearchStudy


_DEFAULT_PATH = Path(__file__).parent / "studies_final.json"


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def seed(path: Path = _DEFAULT_PATH) -> None:
    studies = json.loads(path.read_text())
    print(f"Loaded {len(studies)} studies from {path}")

    Base.metadata.create_all(engine)

    with SessionLocal() as db:
        rows = [
            {
                "nct_id":                s["nct_id"],
                "brief_title":           s.get("brief_title") or "",
                "official_title":        s.get("official_title"),
                "status":                s.get("status"),
                "start_date":            _parse_date(s.get("start_date")),
                "completion_date":       _parse_date(s.get("completion_date")),
                "study_type":            s.get("study_type"),
                "phase":                 s.get("phase") or [],
                "conditions":            s.get("conditions") or [],
                "conditions_normalized": s.get("conditions_normalized") or [],
                "interventions":         s.get("interventions") or [],
                "intervention_names":    s.get("intervention_names") or [],
                "brief_summary":         s.get("brief_summary"),
                "eligibility":           s.get("eligibility"),
                "locations":             s.get("locations") or [],
                "countries":             s.get("countries") or [],
                "sponsor":               s.get("sponsor"),
                "contact_emails":        s.get("contact_emails") or [],
                "study_summary":         s.get("study_summary"),
                "study_embedding":       s.get("embedding"),
            }
            for s in studies
            if s.get("nct_id")
        ]

        stmt = pg_insert(ResearchStudy).values(rows)
        stmt = stmt.on_conflict_do_update(
            index_elements=["nct_id"],
            set_={
                col: stmt.excluded[col]
                for col in stmt.excluded.c.keys()
                if col != "nct_id"
            },
        )
        db.execute(stmt)
        db.commit()
        print(f"Upserted {len(rows)} studies into research_studies.")


if __name__ == "__main__":
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else _DEFAULT_PATH
    seed(path)
