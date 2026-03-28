from datetime import date, datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from app.database import engine, Base
import app.models

Base.metadata.create_all(bind=engine)

class PaperCreate(BaseModel):
    title: str
    abstract: str | None = None
    doi: str | None = None


class PaperOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    abstract: str | None
    doi: str | None


class ResearchPaperCreate(BaseModel):
    researcher_id: int
    title: str
    abstract: str | None = None
    journal: str | None = None
    doi: str | None = None
    url: str | None = None
    published_at: date | None = None


class ResearchPaperOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    researcher_id: int
    title: str
    abstract: str | None
    journal: str | None
    doi: str | None
    url: str | None
    published_at: date | None
    created_at: datetime


# --- Clinical trial (NCT) payload — must match pipeline JSON exactly ---


class StudyIntervention(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: str
    name: str


class StudyEligibility(BaseModel):
    model_config = ConfigDict(extra="forbid")

    criteria_raw: str
    min_age: float
    max_age: float
    sex: str
    healthy_volunteers: bool
    inclusion_criteria: list[str]
    exclusion_criteria: list[str]


class StudyLocation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    facility: str
    city: str
    state: str | None
    country: str
    lat: float
    lon: float


class ResearchStudyCreate(BaseModel):
    """Request body shape for ingesting a trial record (e.g. ClinicalTrials.gov-style)."""

    model_config = ConfigDict(extra="forbid")

    nct_id: str
    brief_title: str
    official_title: str
    status: str
    start_date: date
    completion_date: date
    phase: list[str]
    study_type: str
    conditions: list[str]
    conditions_normalized: list[str]
    interventions: list[StudyIntervention]
    intervention_names: list[str]
    brief_summary: str
    eligibility: StudyEligibility
    locations: list[StudyLocation]
    countries: list[str]
    sponsor: str
    search_text: str | None = None


class ResearchStudyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    researcher_id: int | None
    nct_id: str
    brief_title: str
    official_title: str | None
    status: str | None
    start_date: date | None
    completion_date: date | None
    study_type: str | None
    phase: list[str]
    conditions: list[str]
    conditions_normalized: list[str]
    interventions: list[StudyIntervention]
    intervention_names: list[str]
    brief_summary: str | None
    eligibility: StudyEligibility | None
    locations: list[StudyLocation]
    countries: list[str]
    sponsor: str | None
    search_text: str | None
    created_at: datetime


class ResearcherCreate(BaseModel):
    clerk_user_id: str
    orcid_id: str | None = None
    full_name: str
    email: EmailStr | None = None


class ResearcherOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    clerk_user_id: str
    orcid_id: str | None
    full_name: str
    email: str | None


class PatientStatusCreate(BaseModel):
    user_id: int
    description: str | None = None
    history: str | None = None
    medical_notes: str | None = None
    medical_summary: str | None = None
    conditions: list[str] = []
    drugs: list[str] = []
    symptoms: list[str] = []


class PatientStatusOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    description: str | None
    history: str | None
    medical_notes: str | None
    medical_summary: str | None
    conditions: list[str]
    drugs: list[str]
    symptoms: list[str]
