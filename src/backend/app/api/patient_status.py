from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, PatientStatus
from app.schemas import PatientStatusCreate, PatientStatusOut
from app.api.matching import build_patient_query_text
from data.embedder import get_embedder

router = APIRouter(prefix="/patient-status", tags=["patient-statuses"])


@router.post("/", response_model=PatientStatusOut)
def create_patient_status(
    payload: PatientStatusCreate,
    db: Session = Depends(get_db),
):
    user = db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    patient_status = PatientStatus(
        user_id=payload.user_id,
        sex=payload.sex,
        location=payload.location,
        age=payload.age,
        description=payload.description,
        history=payload.history,
        medical_notes=payload.medical_notes,
        medical_summary=payload.medical_summary,
        conditions=payload.conditions,
        drugs=payload.drugs,
        symptoms=payload.symptoms,
    )

    query_text = build_patient_query_text(patient_status)
    if query_text.strip():
        patient_status.patient_vector_summary = get_embedder("local").embed(query_text)

    db.add(patient_status)
    db.commit()
    db.refresh(patient_status)

    return patient_status