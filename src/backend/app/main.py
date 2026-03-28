from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

from fastapi import FastAPI

from app.database import Base, engine
from app.webhooks import router as webhook_router
from app.api.patient_status import router as patient_status_router

app = FastAPI()

app.include_router(webhook_router)
app.include_router(patient_status_router)


Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/routes")
def list_routes():
    return [route.path for route in app.routes]