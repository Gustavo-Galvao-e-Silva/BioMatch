from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from anamnesis import AnamnesisAgent, current_state as _initial_state
from schemas import PatientSummary, MedicalReport
from agents import report_agent, pdf_report_agent
from dotenv import load_dotenv
import anamnesis
import base64
import json

load_dotenv()

APP_NAME = "anamnesis_app"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

anamnesis_agent = AnamnesisAgent()


# --- Shared context model ---

class Ctx(BaseModel):
    goals: list[str] = [
        "Determine duration of symptoms",
        "Check for history of allergies",
        "Confirm if pain is localized",
        "Determine patient age",
        "Determine which country patient is from",
        "Figure out the patient's occupation",
    ]
    message: str | None = None
    reply: str | None = None
    complete: bool = False
    report: dict | None = None
    state: dict | None = None


# --- Helpers ---

def _build_session_state(ctx: Ctx) -> dict:
    previous_state = ctx.state or {}
    return {
        "current_goals": ctx.goals,
        "patient_summary": previous_state.get(
            "patient_summary",
            PatientSummary(findings_summary="", confidence_score=0.0),
        ),
        "awaiting_patient": ctx.state is not None,
        "last_patient_message": ctx.message or "",
        "last_doctor_message": previous_state.get("last_doctor_message", ""),
    }


def _report_to_dict(result: MedicalReport) -> dict:
    return {
        "conditions": result.conditions,
        "drugs": result.drugs,
        "description": result.description,
        "history": result.history,
        "medical_notes": result.medical_notes,
        "symptoms": result.symptoms,
        "medical_summary": result.medical_summary,
    }


def _extract_report_from_events(events) -> MedicalReport | None:
    for event in events:
        if hasattr(event, "data") and isinstance(event.data, MedicalReport):
            return event.data
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    try:
                        data = json.loads(part.text.strip())
                        print(f"[DEBUG REPORT] Attempting parse: {data}")
                        result = MedicalReport(**data)
                        if any([result.conditions, result.drugs, result.description,
                                result.history, result.medical_notes, result.symptoms,
                                result.medical_summary]):
                            return result
                    except Exception as e:
                        print(f"[DEBUG REPORT] Parse failed: {e}")
    return None


def _extract_reply(events) -> str:
    """Extract doctor/anamnesis reply, skipping all internal JSON payloads."""
    parts = []
    for event in events:
        if not (event.content and event.content.parts):
            continue
        author = getattr(event, "author", None)
        if author not in ("doctor", "anamnesis", None, ""):
            continue
        for part in event.content.parts:
            if not part.text:
                continue
            try:
                json.loads(part.text.strip())
                continue  # skip anything that parses as JSON
            except Exception:
                pass
            parts.append(part.text)
    return "\n".join(parts)


async def _run_ephemeral(
    agent,
    state: dict,
    new_message: types.Content,
) -> list:
    session_service = InMemorySessionService()

    await session_service.create_session(
        app_name=APP_NAME,
        user_id="ephemeral_user",
        session_id="ephemeral_session",
        state=state,
    )

    runner = Runner(
        agent=agent,
        app_name=APP_NAME,
        session_service=session_service,
    )

    events = [
        event async for event in runner.run_async(
            user_id="ephemeral_user",
            session_id="ephemeral_session",
            new_message=new_message,
        )
    ]

    await session_service.delete_session(
        app_name=APP_NAME,
        user_id="ephemeral_user",
        session_id="ephemeral_session",
    )

    return events


# --- Endpoints ---

@app.post("/message", response_model=Ctx)
async def send_message(ctx: Ctx):
    if not ctx.message:
        raise HTTPException(status_code=400, detail="`message` is required in ctx.")

    events = await _run_ephemeral(
        agent=anamnesis_agent,
        state=_build_session_state(ctx),
        new_message=types.Content(
            role="user",
            parts=[types.Part(text=ctx.message)],
        ),
    )

    reply_text = _extract_reply(events)

    # Read the deep copy written by AnamnesisAgent at the end of its run
    final_state = anamnesis.current_state
    updated_goals = final_state.get("current_goals", ctx.goals)

    # If complete and no reply was captured, use a default completion message
    if not reply_text and len(updated_goals) == 0:
        reply_text = "Anamnesis complete. All goals have been addressed."

    return ctx.model_copy(update={
        "goals": updated_goals,
        "reply": reply_text,
        "complete": len(updated_goals) == 0,
        "message": None,
        "state": {
            **final_state,
            "last_patient_message": ctx.message,
            "last_doctor_message": reply_text,
        },
    })


@app.post("/report")
async def generate_report(ctx: Ctx):
    if (not ctx.state):
        ctx = {"state":ctx}

    events = await _run_ephemeral(
        agent=report_agent,
        state=_build_session_state(ctx),
        new_message=types.Content(
            role="user",
            parts=[types.Part(text="Generate the medical report.")],
        ),
    )

    result = _extract_report_from_events(events)
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to generate report.")

    return _report_to_dict(result)


@app.post("/report/pdf")
async def report_from_pdfs(ctx: Ctx, files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    parts = []
    for file in files:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail=f"{file.filename} is not a PDF.")
        raw = await file.read()
        parts.append(
            types.Part(inline_data=types.Blob(
                mime_type="application/pdf",
                data=base64.standard_b64encode(raw).decode("utf-8"),
            ))
        )

    parts.append(types.Part(text="Analyze the documents and generate the medical report."))

    events = await _run_ephemeral(
        agent=pdf_report_agent,
        state={},
        new_message=types.Content(role="user", parts=parts),
    )

    result = _extract_report_from_events(events)
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to generate report from PDFs.")

    return _report_to_dict(result)


# --- Frontend adapter ---

class ChatbotRequest(BaseModel):
    state: dict | None = None
    message: str


class ChatbotResponse(BaseModel):
    state: dict
    response: str
    end: bool


@app.post("/chatbot/post_patient_message", response_model=ChatbotResponse)
async def post_patient_message(req: ChatbotRequest):
    ctx = Ctx(
        goals=req.state.get("current_goals", Ctx().goals) if req.state else Ctx().goals,
        message=req.message,
        state=req.state,
    )

    result = await send_message(ctx)

    return ChatbotResponse(
        state=result.state,
        response=result.reply or "",
        end=result.complete,
    )


# --- Entry point ---

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
