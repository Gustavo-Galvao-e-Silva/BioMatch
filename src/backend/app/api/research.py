from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ResearchStudy
from app.schemas import ResearchStudyOut

from data.pipeline import get_study_by_id

router = APIRouter(prefix="/research", tags=["research"])


@router.post(
    "/claim_research",
    response_model=ResearchStudyOut,
    status_code=status.HTTP_201_CREATED,
)
def claim_research(
    researcher_email: str,
    nct_id: str,
    researcher_id: int | None = None,
    db: Session = Depends(get_db),
):
    if not researcher_email or not nct_id:
        raise HTTPException(
            status_code=400, detail="Requires NCT ID and researcher email"
        )

    existing = db.query(ResearchStudy).filter(ResearchStudy.nct_id == nct_id).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Study {nct_id} already claimed")

    try:
        payload = get_study_by_id(nct_id, researcher_email)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

    study = ResearchStudy(
        researcher_id=researcher_id,
        nct_id=payload["nct_id"],
        brief_title=payload["brief_title"],
        official_title=payload.get("official_title"),
        status=payload.get("status"),
        start_date=payload.get("start_date"),
        completion_date=payload.get("completion_date"),
        study_type=payload.get("study_type"),
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
    try:
        db.add(study)
        db.commit()
        db.refresh(study)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"Study {nct_id} already claimed")

    return study
