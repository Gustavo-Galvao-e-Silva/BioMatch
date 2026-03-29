from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Patient, PatientStatus
from app.schemas import PatientStatusCreate, PatientStatusOut

router = APIRouter(prefix="/patient-status", tags=["patient-statuses"])


@router.post("/", response_model=PatientStatusOut)
def create_patient_status(
    payload: PatientStatusCreate,
    db: Session = Depends(get_db),
):
    patient = db.get(Patient, payload.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient_status = PatientStatus(
        patient_id=payload.patient_id,
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

    db.add(patient_status)
    db.commit()
    db.refresh(patient_status)

    return patient_status