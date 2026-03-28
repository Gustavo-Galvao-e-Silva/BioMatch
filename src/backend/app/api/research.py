from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ResearchPaper, Researcher, ResearchStudy
from app.schemas import (
    ResearchPaperCreate,
    ResearchPaperOut,
    ResearchStudyCreate,
    ResearchStudyOut,
)

router = APIRouter(prefix="/research", tags=["research"])


@router.post("/papers", response_model=ResearchPaperOut, status_code=status.HTTP_201_CREATED)
def create_research_paper(
    payload: ResearchPaperCreate,
    db: Session = Depends(get_db),
):
    researcher = db.get(Researcher, payload.researcher_id)
    if not researcher:
        raise HTTPException(status_code=404, detail="Researcher not found")

    if payload.doi:
        existing = db.execute(
            select(ResearchPaper).where(ResearchPaper.doi == payload.doi)
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A paper with this DOI already exists",
            )

    paper = ResearchPaper(
        researcher_id=payload.researcher_id,
        title=payload.title,
        abstract=payload.abstract,
        journal=payload.journal,
        doi=payload.doi,
        url=payload.url,
        published_at=payload.published_at,
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)

    return paper


@router.post("/studies", response_model=ResearchStudyOut, status_code=status.HTTP_201_CREATED)
def create_research_study(
    payload: ResearchStudyCreate,
    db: Session = Depends(get_db),
    researcher_id: Annotated[int | None, Query(description="Optional link to a researcher row")] = None,
):
    if researcher_id is not None and db.get(Researcher, researcher_id) is None:
        raise HTTPException(status_code=404, detail="Researcher not found")

    existing = db.execute(
        select(ResearchStudy).where(ResearchStudy.nct_id == payload.nct_id)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A study with this NCT ID already exists",
        )

    study = ResearchStudy(
        researcher_id=researcher_id,
        nct_id=payload.nct_id,
        brief_title=payload.brief_title,
        official_title=payload.official_title,
        status=payload.status,
        start_date=payload.start_date,
        completion_date=payload.completion_date,
        study_type=payload.study_type,
        phase=payload.phase,
        conditions=payload.conditions,
        conditions_normalized=payload.conditions_normalized,
        interventions=[i.model_dump() for i in payload.interventions],
        intervention_names=payload.intervention_names,
        brief_summary=payload.brief_summary,
        eligibility=payload.eligibility.model_dump(),
        locations=[loc.model_dump() for loc in payload.locations],
        countries=payload.countries,
        sponsor=payload.sponsor,
        search_text=payload.search_text,
    )
    db.add(study)
    db.commit()
    db.refresh(study)

    return study
