from pathlib import Path
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

from fastapi import FastAPI

from app.database import Base, engine
from app.webhooks import router as webhook_router
from app.api.patient_status import router as patient_status_router
from app.api.research import router as research_router
from app.api.chatbot import router as chatbot_router
from app.api.chat import router as chat_router
from app.api.matching import router as matching_router
from app.api.user import router as user_router

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models
Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook_router)
app.include_router(user_router)
app.include_router(patient_status_router)
app.include_router(research_router)
app.include_router(chatbot_router)
app.include_router(chat_router)
app.include_router(matching_router)

@app.get("/routes")
def list_routes():
    return [route.path for route in app.routes]

@app.get("/")
def root():
    return {"message": "API is running"}
