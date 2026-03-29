from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import cast, Float, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PatientStatus, ResearchStudy, User
from app.schemas import PatientMatchOut, PatientStatusOut, ResearchStudyOut, StudyMatchOut
from data.embedder import get_embedder

router = APIRouter(prefix="/matching", tags=["matching"])

_ACTIVE_STATUS = "RECRUITING"


def build_patient_query_text(patient: PatientStatus) -> str:
    parts = []
    if patient.medical_summary:
        parts.append(patient.medical_summary)
    if patient.symptoms:
        parts.append(f"Symptoms: {'; '.join(patient.symptoms)}")
    if patient.drugs:
        parts.append(f"Current medications: {'; '.join(patient.drugs)}")
    if patient.history:
        parts.append(f"History: {patient.history}")
    return "\n\n".join(parts)


def _compute_score(
    cosine_distance: float,
    patient: PatientStatus,
    study: ResearchStudy,
) -> float:
    similarity = max(0.0, 1.0 - cosine_distance)
    base = similarity ** 0.5 * 8.0

    bonus = 0.0

    # Condition overlap: +1.0 per match, cap at 1.0
    if patient.conditions:
        patient_conds = {c.lower() for c in patient.conditions}
        study_conds = set(study.conditions_normalized or [])
        bonus += min(1.0, len(patient_conds & study_conds) * 1.0)

    # Drug / intervention overlap: +0.5 per match, cap at 0.5
    if patient.drugs:
        patient_drug_tokens = {d.lower().split()[0] for d in patient.drugs}
        study_interventions = study.intervention_names or []
        drug_hits = sum(
            1 for token in patient_drug_tokens
            if any(token in name for name in study_interventions)
        )
        bonus += min(0.5, drug_hits * 0.5)

    return round(min(10.0, base + bonus), 2)


def _query_matches_for_patient(
    patient: PatientStatus, db: Session, limit: int = 20
) -> list[tuple[ResearchStudy, float]]:
    """Run hard filter + similarity search for a single PatientStatus."""
    query_text = build_patient_query_text(patient)
    if not query_text.strip():
        return []

    embedder = get_embedder("local")
    patient_vec = embedder.embed(query_text)

    filters = [
        ResearchStudy.status == _ACTIVE_STATUS,
        ResearchStudy.study_embedding.isnot(None),
    ]

    if patient.age is not None:
        min_age_col = cast(ResearchStudy.eligibility["min_age"].astext, Float)
        max_age_col = cast(ResearchStudy.eligibility["max_age"].astext, Float)
        filters.append(min_age_col <= patient.age)
        filters.append(max_age_col >= patient.age)

    if patient.sex is not None:
        sex_col = ResearchStudy.eligibility["sex"].astext
        filters.append(or_(sex_col == "ALL", sex_col == patient.sex.upper()))

    distance_col = ResearchStudy.study_embedding.cosine_distance(patient_vec).label("distance")

    return (
        db.query(ResearchStudy, distance_col)
        .filter(*filters)
        .order_by("distance")
        .limit(limit)
        .all()
    )


@router.get("/patient/{clerk_id}", response_model=list[StudyMatchOut])
def match_user_to_studies(
    clerk_id: str,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.clerk_user_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    statuses = (
        db.query(PatientStatus)
        .filter(PatientStatus.user_id == user.id)
        .all()
    )
    print("PAPAGAAAAAAIO")
    print(statuses)
    print("PAPAGAAAAAAIO")
    if not statuses:
        raise HTTPException(status_code=404, detail="No patient statuses found for this user")

    # Collect best score per study across all statuses, then rank
    best: dict[int, tuple[ResearchStudy, float]] = {}
    for status in statuses:
        for study, dist in _query_matches_for_patient(status, db):
            score = _compute_score(dist, status, study)
            if study.id not in best or score > best[study.id][1]:
                best[study.id] = (study, score)

    ranked = sorted(best.values(), key=lambda x: x[1], reverse=True)[:10]

    return [
        StudyMatchOut(study=ResearchStudyOut.model_validate(study), score=score)
        for study, score in ranked
    ]


@router.get("/study/{study_id}", response_model=list[PatientMatchOut])
def match_study_to_patients(
    study_id: int,
    db: Session = Depends(get_db),
):
    study = db.get(ResearchStudy, study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    if study.study_embedding is None:
        raise HTTPException(status_code=422, detail="Study has no embedding")

    eligibility = study.eligibility or {}
    min_age = eligibility.get("min_age")
    max_age = eligibility.get("max_age")
    sex = eligibility.get("sex", "ALL")

    filters = [PatientStatus.patient_vector_summary.isnot(None)]

    if min_age is not None and float(min_age) > 0:
        filters.append(
            or_(PatientStatus.age.is_(None), PatientStatus.age >= float(min_age))
        )
    if max_age is not None and float(max_age) < 150:
        filters.append(
            or_(PatientStatus.age.is_(None), PatientStatus.age <= float(max_age))
        )
    if sex and sex != "ALL":
        filters.append(
            or_(PatientStatus.sex.is_(None), PatientStatus.sex == sex)
        )

    distance_col = PatientStatus.patient_vector_summary.cosine_distance(
        study.study_embedding
    ).label("distance")

    rows = (
        db.query(PatientStatus, distance_col)
        .filter(*filters)
        .order_by("distance")
        .limit(20)
        .all()
    )

    return [
        PatientMatchOut(
            patient=PatientStatusOut.model_validate(patient),
            score=_compute_score(dist, patient, study),
        )
        for patient, dist in rows
    ]
