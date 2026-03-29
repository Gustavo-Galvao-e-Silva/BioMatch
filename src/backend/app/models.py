from datetime import datetime, date

from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    clerk_user_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="user")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    patient_statuses: Mapped[list["PatientStatus"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    doctor_profile: Mapped["DoctorProfile | None"] = relationship(
        back_populates="user",
        uselist=False,
    )
    researcher_profile: Mapped["Researcher | None"] = relationship(
        back_populates="user",
        uselist=False,
    )


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )

    specialty: Mapped[str | None] = mapped_column(String(255), nullable=True)
    institution: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    years_experience: Mapped[int | None] = mapped_column(nullable=True)
    license_number: Mapped[str | None] = mapped_column(String(100), nullable=True)

    user: Mapped["User"] = relationship(back_populates="doctor_profile")


class Researcher(Base):
    __tablename__ = "researchers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )

    orcid_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    institution: Mapped[str | None] = mapped_column(String(255), nullable=True)
    department: Mapped[str | None] = mapped_column(String(255), nullable=True)
    lab_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    focus_area: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="researcher_profile")

    research_papers: Mapped[list["ResearchPaper"]] = relationship(
        back_populates="researcher",
        cascade="all, delete-orphan",
    )
    research_studies: Mapped[list["ResearchStudy"]] = relationship(
        back_populates="researcher",
    )


class ResearchPaper(Base):
    __tablename__ = "research_papers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    researcher_id: Mapped[int] = mapped_column(
        ForeignKey("researchers.id", ondelete="CASCADE"),
        index=True,
    )

    title: Mapped[str] = mapped_column(String(500))
    abstract: Mapped[str | None] = mapped_column(Text, nullable=True)
    journal: Mapped[str | None] = mapped_column(String(255), nullable=True)
    doi: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    published_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    researcher: Mapped["Researcher"] = relationship(back_populates="research_papers")


class PatientStatus(Base):
    __tablename__ = "patient_statuses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    sex: Mapped[str | None] = mapped_column(String(50), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    age: Mapped[int | None] = mapped_column(nullable=True)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    history: Mapped[str | None] = mapped_column(Text, nullable=True)
    medical_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    medical_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    conditions: Mapped[list[str]] = mapped_column(JSONB, default=list)
    drugs: Mapped[list[str]] = mapped_column(JSONB, default=list)
    symptoms: Mapped[list[str]] = mapped_column(JSONB, default=list)

    patient_vector_summary: Mapped[list[float] | None] = mapped_column(
        Vector(1536),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="patient_statuses")


class ResearchStudy(Base):
    __tablename__ = "research_studies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    researcher_id: Mapped[int | None] = mapped_column(
        ForeignKey("researchers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    nct_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    brief_title: Mapped[str] = mapped_column(String(500))
    official_title: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completion_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    study_type: Mapped[str | None] = mapped_column(String(100), nullable=True)

    phase: Mapped[list[str]] = mapped_column(JSONB, default=list)
    conditions: Mapped[list[str]] = mapped_column(JSONB, default=list)
    conditions_normalized: Mapped[list[str]] = mapped_column(JSONB, default=list)

    interventions: Mapped[list[dict]] = mapped_column(JSONB, default=list)
    intervention_names: Mapped[list[str]] = mapped_column(JSONB, default=list)

    brief_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    eligibility: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    locations: Mapped[list[dict]] = mapped_column(JSONB, default=list)
    countries: Mapped[list[str]] = mapped_column(JSONB, default=list)

    sponsor: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_emails: Mapped[list[str]] = mapped_column(JSONB, default=list)
    study_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    study_embedding: Mapped[list[float] | None] = mapped_column(Vector(384), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    researcher: Mapped["Researcher | None"] = relationship(back_populates="research_studies")

    @property
    def search_text(self) -> str | None:
        return self.study_summary


class SessionEnvironment(Base):
    __tablename__ = "session_environments"

    session_id = Column(String, primary_key=True, index=True)
    environment = Column(JSONB, nullable=False)