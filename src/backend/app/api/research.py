from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ResearchStudy
from app.schemas import ResearchStudyOut
from data.pipeline import get_study_by_id

router = APIRouter(prefix="/research", tags=["research"])


@router.get("/my_studies", response_model=list[ResearchStudyOut])
def get_my_studies(
    clerk_user_id: str,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "researcher":
        raise HTTPException(status_code=403, detail="Only researchers can access this endpoint")
    return db.query(ResearchStudy).filter(ResearchStudy.researcher_id == user.id).all()


@router.post("/claim_research", response_model=ResearchStudyOut, status_code=status.HTTP_201_CREATED)
def claim_research(
    researcher_email: str,
    nct_id: str,
    clerk_user_id: str,
    db: Session = Depends(get_db),
):
    # 1. Busca o usuário direto pelo Clerk ID
    user_record = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found in database")

    # 2. Garante que ele é um pesquisador
    if user_record.role != "researcher":
        raise HTTPException(status_code=403, detail="Only researchers can claim studies")

    # 3. Verifica se a pesquisa já foi cadastrada
    existing = db.query(ResearchStudy).filter(ResearchStudy.nct_id == nct_id).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Study {nct_id} already claimed")

    # 4. Busca dados no ClinicalTrials.gov
    try:
        payload = get_study_by_id(nct_id, researcher_email)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    
    # 5. Salva a pesquisa vinculada ao user.id (que agora é o researcher_id)
    study = ResearchStudy(
        researcher_id=user_record.id, 
        nct_id=payload["nct_id"],
        brief_title=payload["brief_title"],
        official_title=payload.get("official_title"),
        status=payload.get("status"),
        phase=payload.get("phase", []),
        conditions=payload.get("conditions", []),
        conditions_normalized=payload.get("conditions_normalized", []),
        interventions=payload.get("interventions", []),
        intervention_names=payload.get("intervention_names", []),
        brief_summary=payload.get("brief_summary"),
        eligibility=payload.get("eligibility"),
        locations=payload.get("locations", []),
        countries=payload.get("countries", []),
        sponsor=payload.get("sponsor"),
        contact_emails=payload.get("contact_emails", []),
        study_summary=payload.get("study_summary"),
        study_embedding=payload.get("embedding"),
    )

    db.add(study)
    db.commit()
    db.refresh(study)
    return study