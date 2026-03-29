from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, PatientStatus
from app.schemas import PatientStatusCreate, UserOut
from backend.data import embedder

router = APIRouter(prefix="/patient-status", tags=["patient-statuses"])


@router.post("/", response_model=UserOut)
def update_patient_medical_info(
    payload: PatientStatusCreate,
    db: Session = Depends(get_db),
):
    # 1. Buscar o usuário pelo Clerk ID
    user = db.execute(
        select(User).where(User.clerk_user_id == payload.clerk_user_id)
    ).scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Atualizar os campos principais no User
    user.location = payload.location
    user.bio = payload.description

    # 3. Manter patient_data JSONB no User para serialização rápida
    user.patient_data = {
        "sex": payload.sex,
        "age": payload.age,
        "history": payload.history,
        "medical_notes": payload.medical_notes,
        "medical_summary": payload.medical_summary,
        "conditions": payload.conditions,
        "drugs": payload.drugs,
        "symptoms": payload.symptoms,
    }

    # 4. Upsert PatientStatus usando o user.id interno encontrado pelo clerk_user_id
    patient_status = db.execute(
        select(PatientStatus).where(PatientStatus.user_id == user.id)
    ).scalars().first()

    if patient_status is None:
        patient_status = PatientStatus(user_id=user.id)
        db.add(patient_status)

    patient_status.age = payload.age
    patient_status.sex = payload.sex
    patient_status.location = payload.location
    patient_status.description = payload.description
    patient_status.history = payload.history
    patient_status.medical_notes = payload.medical_notes
    patient_status.medical_summary = payload.medical_summary
    patient_status.conditions = payload.conditions
    patient_status.drugs = payload.drugs
    patient_status.symptoms = payload.symptoms

    emb = embedder.get_embedder()
    embedding = emb.embed(patient_status)

    patient_status.patient_vector_summary = embedding
    db.commit()
    db.refresh(user)

    return user