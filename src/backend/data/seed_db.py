"""
Reads studies_final.json and upserts all studies into the research_studies table.
Also seeds test users and patient statuses for development.

Usage:
    cd src/backend
    python data/seed_db.py                     # uses studies_final.json
    python data/seed_db.py path/to/file.json   # custom path
"""
from __future__ import annotations

import json
import sys
from datetime import date, datetime
from pathlib import Path

# Allow running from src/backend directly
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.database import SessionLocal, engine, Base
from app.models import ResearchStudy, User, PatientStatus
from app.api.matching import build_patient_query_text
from data.embedder import get_embedder


_DEFAULT_PATH = Path(__file__).parent / "studies_final.json"

_TEST_USERS = [
    {
        "clerk_user_id": "seed_patient_t2d",
        "email": "patient.diabetes@demo.com",
        "full_name": "Carlos Mendes",
        "role": "user",
        "statuses": [
            {
                "age": 45,
                "sex": "MALE",
                "location": "Brazil",
                "medical_summary": (
                    "Patient presents with Type 2 Diabetes Mellitus, poorly controlled "
                    "with oral agents. HbA1c 9.2%. Overweight with BMI 31."
                ),
                "symptoms": ["polyuria", "polydipsia", "fatigue", "blurred vision"],
                "drugs": ["Metformin 1000mg", "Glipizide 10mg"],
                "history": "Diagnosed with T2DM 5 years ago. Hypertension managed with lisinopril.",
                "conditions": ["Diabetes Mellitus, Type 2"],
            }
        ],
    },
    {
        "clerk_user_id": "seed_patient_breast_cancer",
        "email": "patient.cancer@demo.com",
        "full_name": "Ana Lima",
        "role": "user",
        "statuses": [
            {
                "age": 52,
                "sex": "FEMALE",
                "location": "Brazil",
                "medical_summary": (
                    "Post-menopausal woman with newly diagnosed Stage II HR+ HER2- breast cancer. "
                    "Underwent lumpectomy. Currently on adjuvant hormone therapy."
                ),
                "symptoms": ["breast lump", "axillary lymph node swelling"],
                "drugs": ["Letrozole 2.5mg", "Calcium + Vitamin D"],
                "history": "Family history of breast cancer (mother). BRCA1/2 negative.",
                "conditions": ["Breast Cancer", "Hormone Receptor Positive Breast Cancer"],
            }
        ],
    },
    {
        "clerk_user_id": "seed_patient_depression",
        "email": "patient.depression@demo.com",
        "full_name": "João Ferreira",
        "role": "user",
        "statuses": [
            {
                "age": 29,
                "sex": "MALE",
                "location": "Brazil",
                "medical_summary": (
                    "Young adult with treatment-resistant major depressive disorder. "
                    "Failed two SSRI trials. PHQ-9 score 18. No suicidal ideation."
                ),
                "symptoms": ["persistent low mood", "anhedonia", "insomnia", "poor concentration"],
                "drugs": ["Sertraline 200mg", "Mirtazapine 30mg"],
                "history": "MDD since age 24. One prior hospitalization. Concurrent mild ADHD.",
                "conditions": ["Major Depressive Disorder", "ADHD"],
            }
        ],
    },
    {
        "clerk_user_id": "seed_patient_alzheimer",
        "email": "patient.alzheimer@demo.com",
        "full_name": "Maria Santos",
        "role": "user",
        "statuses": [
            {
                "age": 71,
                "sex": "FEMALE",
                "location": "Portugal",
                "medical_summary": (
                    "Elderly woman with mild cognitive impairment and strong family history of "
                    "Alzheimer's disease. MMSE 24/30. ApoE4 carrier. Independent in daily activities."
                ),
                "symptoms": ["short-term memory loss", "word-finding difficulty", "mild disorientation"],
                "drugs": ["Donepezil 5mg", "Vitamin E"],
                "history": "Father and brother had Alzheimer's. Hypertension controlled with amlodipine.",
                "conditions": ["Mild Cognitive Impairment", "Alzheimer Disease"],
            }
        ],
    },
    # --- NEUROLOGIA (PARKINSON) ---
    {
        "clerk_user_id": "seed_parkinson_1",
        "email": "parkinson@demo.com",
        "full_name": "João Mendes",
        "role": "user",
        "statuses": [{
            "age": 72, "sex": "MALE", "location": "Boston",
            "medical_summary": "Parkinson’s disease with motor fluctuations.",
            "conditions": ["Parkinson Disease"],
            "drugs": ["Levodopa", "Carbidopa"],
            "symptoms": ["tremor", "bradykinesia", "rigidity"]
        }]
    },

    # --- PSIQUIATRIA (ADHD) ---
    {
        "clerk_user_id": "seed_adhd_1",
        "email": "adhd@demo.com",
        "full_name": "Lucas Pereira",
        "role": "user",
        "statuses": [{
            "age": 23, "sex": "MALE", "location": "Austin",
            "medical_summary": "Attention-Deficit/Hyperactivity Disorder (ADHD).",
            "conditions": ["ADHD"],
            "drugs": ["Adderall"],
            "symptoms": ["inattention", "impulsivity"]
        }]
    },

    # --- GASTRO (CROHN) ---
    {
        "clerk_user_id": "seed_crohn_1",
        "email": "crohn@demo.com",
        "full_name": "Fernanda Lima",
        "role": "user",
        "statuses": [{
            "age": 29, "sex": "FEMALE", "location": "Denver",
            "medical_summary": "Crohn’s disease with ileal involvement.",
            "conditions": ["Crohn Disease"],
            "drugs": ["Infliximab"],
            "symptoms": ["abdominal pain", "diarrhea"]
        }]
    },

    # --- INFECTO (HIV) ---
    {
        "clerk_user_id": "seed_hiv_1",
        "email": "hiv@demo.com",
        "full_name": "Carlos Henrique",
        "role": "user",
        "statuses": [{
            "age": 41, "sex": "MALE", "location": "San Francisco",
            "medical_summary": "HIV infection, stable on ART.",
            "conditions": ["HIV"],
            "drugs": ["Biktarvy"],
            "symptoms": ["fatigue"]
        }]
    },

    # --- DERMATOLOGIA (PSORIASIS) ---
    {
        "clerk_user_id": "seed_psoriasis_1",
        "email": "psoriasis@demo.com",
        "full_name": "Ana Clara",
        "role": "user",
        "statuses": [{
            "age": 37, "sex": "FEMALE", "location": "Seattle",
            "medical_summary": "Moderate plaque psoriasis.",
            "conditions": ["Psoriasis"],
            "drugs": ["Secukinumab"],
            "symptoms": ["skin plaques", "itching"]
        }]
    },

    # --- RESPIRATÓRIO (ASTHMA) ---
    {
        "clerk_user_id": "seed_asthma_1",
        "email": "asthma@demo.com",
        "full_name": "Pedro Alves",
        "role": "user",
        "statuses": [{
            "age": 19, "sex": "MALE", "location": "Orlando",
            "medical_summary": "Mild persistent asthma.",
            "conditions": ["Asthma"],
            "drugs": ["Albuterol"],
            "symptoms": ["wheezing", "shortness of breath"]
        }]
    },

    # --- DIABETES ---
    {
        "clerk_user_id": "seed_diabetes_1",
        "email": "diabetes@demo.com",
        "full_name": "Mariana Costa",
        "role": "user",
        "statuses": [{
            "age": 55, "sex": "FEMALE", "location": "Phoenix",
            "medical_summary": "Type 2 diabetes mellitus.",
            "conditions": ["Diabetes Mellitus Type 2"],
            "drugs": ["Metformin"],
            "symptoms": ["polyuria", "fatigue"]
        }]
    },

    # --- HIPERTENSÃO ---
    {
        "clerk_user_id": "seed_hypertension_1",
        "email": "hypertension@demo.com",
        "full_name": "Ricardo Teixeira",
        "role": "user",
        "statuses": [{
            "age": 63, "sex": "MALE", "location": "Dallas",
            "medical_summary": "Essential hypertension.",
            "conditions": ["Hypertension"],
            "drugs": ["Losartan"],
            "symptoms": ["headache"]
        }]
    },

    # --- DEPRESSÃO ---
    {
        "clerk_user_id": "seed_depression_1",
        "email": "depression@demo.com",
        "full_name": "Juliana Rocha",
        "role": "user",
        "statuses": [{
            "age": 31, "sex": "FEMALE", "location": "Atlanta",
            "medical_summary": "Major depressive disorder.",
            "conditions": ["Depression"],
            "drugs": ["Sertraline"],
            "symptoms": ["low mood", "insomnia"]
        }]
    },

    # --- ALZHEIMER ---
    {
        "clerk_user_id": "seed_alzheimer_1",
        "email": "alz@demo.com",
        "full_name": "Antônio Silva",
        "role": "user",
        "statuses": [{
            "age": 78, "sex": "MALE", "location": "Los Angeles",
            "medical_summary": "Alzheimer’s disease, moderate stage.",
            "conditions": ["Alzheimer Disease"],
            "drugs": ["Donepezil"],
            "symptoms": ["memory loss", "confusion"]
        }]
    },

    # --- ARTRITE ---
    {
        "clerk_user_id": "seed_arthritis_1",
        "email": "arthritis@demo.com",
        "full_name": "Patrícia Gomes",
        "role": "user",
        "statuses": [{
            "age": 50, "sex": "FEMALE", "location": "Chicago",
            "medical_summary": "Rheumatoid arthritis.",
            "conditions": ["Rheumatoid Arthritis"],
            "drugs": ["Methotrexate"],
            "symptoms": ["joint pain", "swelling"]
        }]
    },

    # --- EPILEPSIA ---
    {
        "clerk_user_id": "seed_epilepsy_1",
        "email": "epilepsy@demo.com",
        "full_name": "Bruno Martins",
        "role": "user",
        "statuses": [{
            "age": 27, "sex": "MALE", "location": "Houston",
            "medical_summary": "Generalized epilepsy.",
            "conditions": ["Epilepsy"],
            "drugs": ["Valproate"],
            "symptoms": ["seizures"]
        }]
    },
]


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def seed_studies(db, path: Path) -> None:
    studies = json.loads(path.read_text())
    print(f"Loaded {len(studies)} studies from {path}")

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
            col.name: stmt.excluded[col.name]
            for col in ResearchStudy.__table__.columns
            if col.name != "nct_id"
        },
    )
    db.execute(stmt)
    db.commit()
    print(f"Upserted {len(rows)} studies into research_studies.")


def seed_test_patients(db) -> None:
    embedder = get_embedder("local")
    created = 0

    for user_data in _TEST_USERS:
        existing = db.query(User).filter(User.clerk_user_id == user_data["clerk_user_id"]).first()
        if existing:
            user = existing
        else:
            user = User(
                clerk_user_id=user_data["clerk_user_id"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                role=user_data["role"],
                created_at=datetime.utcnow(),
            )
            db.add(user)
            db.flush()
            created += 1

        for s in user_data["statuses"]:
            already = (
                db.query(PatientStatus)
                .filter(PatientStatus.user_id == user.id)
                .first()
            )
            if already:
                continue

            status = PatientStatus(
                user_id=user.id,
                age=s.get("age"),
                sex=s.get("sex"),
                location=s.get("location"),
                medical_summary=s.get("medical_summary"),
                symptoms=s.get("symptoms", []),
                drugs=s.get("drugs", []),
                history=s.get("history"),
                conditions=s.get("conditions", []),
            )
            query_text = build_patient_query_text(status)
            if query_text.strip():
                status.patient_vector_summary = embedder.embed(query_text)

            db.add(status)

    db.commit()
    print(f"Seeded {len(_TEST_USERS)} test users ({created} new) with patient statuses.")


def seed(path: Path = _DEFAULT_PATH) -> None:
    Base.metadata.create_all(engine)

    with SessionLocal() as db:
        seed_studies(db, path)
        seed_test_patients(db)


if __name__ == "__main__":
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else _DEFAULT_PATH
    seed(path)
