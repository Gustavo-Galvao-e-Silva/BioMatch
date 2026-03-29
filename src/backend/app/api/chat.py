from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

router = APIRouter(prefix="/chat", tags=["chat"])


class PersonSearchResponse(BaseModel):
    id: int
    full_name: str
    email: str | None
    role: str


@router.get("/search_people", response_model=list[PersonSearchResponse])
def search_people(
    name: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    people = db.execute(
        select(User).where(User.full_name.ilike(f"%{name}%"))
    ).scalars().all()

    return [
        PersonSearchResponse(
            id=person.id,
            full_name=person.full_name,
            email=person.email,
            role=person.role,
        )
        for person in people
    ]