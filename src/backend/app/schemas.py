from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


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
