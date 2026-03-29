from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import cast, Float, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PatientStatus, ResearchStudy
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


def _to_score(cosine_distance: float) -> float:
    return round(max(0.0, 1.0 - cosine_distance) * 10, 2)


@router.get("/patient/{patient_status_id}", response_model=list[StudyMatchOut])
def match_patient_to_studies(
    patient_status_id: int,
    db: Session = Depends(get_db),
):
    patient = db.get(PatientStatus, patient_status_id)
    if not patient:
        raise HTTPException(status_code=404, detail="PatientStatus not found")

    query_text = build_patient_query_text(patient)
    if not query_text.strip():
        raise HTTPException(
            status_code=422, detail="Patient has no medical information to match on"
        )

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

    rows = (
        db.query(ResearchStudy, distance_col)
        .filter(*filters)
        .order_by("distance")
        .limit(10)
        .all()
    )

    return [
        StudyMatchOut(study=ResearchStudyOut.model_validate(study), score=_to_score(dist))
        for study, dist in rows
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
            patient=PatientStatusOut.model_validate(patient), score=_to_score(dist)
        )
        for patient, dist in rows
    ]
