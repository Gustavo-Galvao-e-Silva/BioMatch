from fastapi import FastAPI

from app.database import Base, engine
from app.routes.webhooks import router as webhook_router
from app.routes.patient_status import router as patient_status_router

app = FastAPI()

app.include_router(webhook_router)
app.include_router(patient_status_router)

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "API is running"}