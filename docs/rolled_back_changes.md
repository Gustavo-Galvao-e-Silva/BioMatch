# Rolled-Back Changes Log

Changes from the following commits were rolled back from `feature/patient-status-vector`
and consolidated into `refactor/rename-tables` (pipeline rename only).

**Commits rolled back:**
- `2f08fb0` — Vector field for patient status
- `68c1d61` — Add Vector & Sex & Age & Location to Patient Status
- `14e3060` — Test cruds

**Only kept:** `pipeline.py` rename (`_build_study_summary` → `_build_search_text`)

---

## `src/backend/app/models.py`

### PatientStatus — new fields (from `2f08fb0` + `68c1d61`)
```python
from pgvector.sqlalchemy import Vector

# Added to PatientStatus:
sex: Mapped[str | None] = mapped_column(String(50), nullable=True)
location: Mapped[str | None] = mapped_column(String(255), nullable=True)
age: Mapped[int | None] = mapped_column(nullable=True)

patient_vector_summary: Mapped[list[float] | None] = mapped_column(
    Vector(1536),
    nullable=True,
)
```

### ResearchStudy — vector embedding field (from `14e3060`)
```python
study_embedding: Mapped[list[float] | None] = mapped_column(
    Vector(1536),
    nullable=True,
)
```

---

## `src/backend/app/schemas.py`

### PatientStatusCreate / PatientStatusOut — new fields (from `68c1d61`)
```python
# Added to PatientStatusCreate:
sex: str | None = None
location: str | None = None
age: int | None = None

# Added to PatientStatusOut:
sex: str | None
location: str | None
age: int | None
created_at: datetime
```

---

## `src/backend/app/api/user.py`

### `PATCH /users/{user_id}/patient-vector` endpoint (from `2f08fb0`)

Full endpoint to update the `patient_vector_summary` on a user's `PatientStatus`:
```python
class PatientVectorUpdate(BaseModel):
    vector: list[float]

@router.patch("/{user_id}/patient-vector")
def update_patient_vector_for_user(user_id: int, payload: PatientVectorUpdate, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    patient_status = db.execute(
        select(PatientStatus)
        .where(PatientStatus.user_id == user_id)
        .order_by(PatientStatus.created_at.desc())
    ).scalars().first()

    if not patient_status:
        raise HTTPException(status_code=404, detail="Patient status not found for this user")

    patient_status.patient_vector_summary = payload.vector
    db.commit()
    db.refresh(patient_status)

    return {"status": "ok", "message": "Patient vector updated", "patient_status_id": patient_status.id, "user_id": user_id}
```

---

## `src/backend/app/api/patient_status.py`

### Pass sex/location/age when constructing PatientStatus (from `68c1d61`)
```python
patient_status = PatientStatus(
    user_id=payload.user_id,
    sex=payload.sex,        # added
    location=payload.location,  # added
    age=payload.age,        # added
    description=payload.description,
    ...
)
```

---

## `src/backend/app/crud.py` — New file (from `14e3060`)

Full CRUD + vector similarity search. Key functions:

```python
ACTIVE_STATUSES = {"RECRUITING", "NOT_YET_RECRUITING", "ACTIVE_NOT_RECRUITING", "ENROLLING_BY_INVITATION"}

# ResearchStudy
def upsert_study(db, data: ResearchStudyCreate, researcher_id=None) -> ResearchStudy
def upsert_studies_bulk(db, studies: list[ResearchStudyCreate], researcher_id=None) -> int
def get_study_by_nct(db, nct_id: str) -> ResearchStudy | None

# PatientStatus
def upsert_patient_status(db, data: PatientStatusCreate) -> PatientStatus
def get_patient_status(db, patient_status_id: int) -> PatientStatus | None
def get_patient_status_by_user(db, user_id: int) -> PatientStatus | None

# Vector search — Stage 1 hard filters pushed to SQL (age, sex, active status)
def search_studies(db, query_embedding, *, patient_age=None, patient_sex=None, active_only=True, top_k=20) -> list[tuple[ResearchStudy, float]]
def search_studies_for_patient(db, patient_status: PatientStatus, top_k=20) -> list[tuple[ResearchStudy, float]]
```

`search_studies` applies hard filters inline via SQLAlchemy:
- `status IN ACTIVE_STATUSES`
- `eligibility["min_age"] <= patient_age <= eligibility["max_age"]`
- `eligibility["sex"] IN ("ALL", patient_sex)`

Orders by `study_embedding <=> query_embedding` (pgvector cosine distance), returns `(study, similarity_score)` tuples.

---

## `src/backend/app/main.py` (from `14e3060`)

Minor cleanup: removed duplicate `list_routes` function and a stray `from fastapi import FastAPI` import that appeared after the router includes.

---

## `src/backend/app/database.py` (from `14e3060`)

Minor: removed an extra blank line. No functional change.

---

## `init.sql` (from `14e3060`)

Removed all `CREATE TABLE` statements (tables are now managed by SQLAlchemy `Base.metadata.create_all`):
```sql
-- Removed:
CREATE TABLE IF NOT EXISTS researchers (...);
CREATE TABLE IF NOT EXISTS papers (...);
CREATE TABLE IF NOT EXISTS paper_embeddings (...);
CREATE INDEX IF NOT EXISTS paper_embeddings_vector_idx ...;
```
Only `CREATE EXTENSION IF NOT EXISTS vector;` remains.

---

## `src/backend/requirements.txt` (from `14e3060`)

```diff
-chromadb
+pgvector
```
(Note: `svix` and `python-dotenv` appear duplicated in the file — should be cleaned up.)
