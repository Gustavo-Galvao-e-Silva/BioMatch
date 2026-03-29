from datetime import date, datetime
from pydantic import BaseModel, EmailStr, ConfigDict

# --- SCHEMAS DE USUÁRIO (Unificado) ---

class UserBase(BaseModel):
    email: EmailStr | None = None
    full_name: str
    role: str
    institution: str | None = None
    location: str | None = None
    bio: str | None = None

class UserCreate(UserBase):
    clerk_user_id: str

class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    clerk_user_id: str
    patient_data: dict | None = None
    role_metadata: dict | None = None
    created_at: datetime

# --- SCHEMAS DE PATIENT STATUS (Para o POST de saúde) ---

class StudyMatchOut(BaseModel):
    study: "ResearchStudyOut"
    score: float


class PatientMatchOut(BaseModel):
    patient: "PatientStatusOut"
    score: float


from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PatientStatusCreate(BaseModel):
    clerk_user_id: str
    age: int | None = None
    sex: str | None = None
    location: str | None = None
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
    age: int | None = None
    sex: str | None = None
    location: str | None = None
    medical_summary: str | None = None
    description: str | None = None
    history: str | None = None
    medical_notes: str | None = None
    conditions: list[str] = []
    drugs: list[str] = []
    symptoms: list[str] = []
    created_at: datetime

# --- CLINICAL TRIAL SCHEMAS (NCT) ---

class StudyIntervention(BaseModel):
    type: str
    name: str

class StudyEligibility(BaseModel):
    criteria_raw: str
    min_age: float | str | None # ClinicalTrials às vezes manda string "18 Years"
    max_age: float | str | None
    sex: str
    healthy_volunteers: bool | str | None
    inclusion_criteria: list[str] | None = None
    exclusion_criteria: list[str] | None = None

class StudyLocation(BaseModel):
    facility: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    lat: float | None = None
    lon: float | None = None

class ResearchStudyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    researcher_id: int | None
    nct_id: str
    brief_title: str
    official_title: str | None
    status: str | None
    start_date: date | None = None
    completion_date: date | None = None
    study_type: str | None = None
    phase: list[str] = []
    conditions: list[str] = []
    conditions_normalized: list[str] = []
    interventions: list[dict] = []
    intervention_names: list[str] = []
    brief_summary: str | None
    eligibility: dict | None
    locations: list[dict] = []
    countries: list[str] = []
    sponsor: str | None
    study_summary: str | None
    created_at: datetime