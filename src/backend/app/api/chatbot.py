from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

UPSTREAM_CHATBOT_URL = "http://44.223.29.123:8000/chatbot/post_patient_message"


class ChatRequest(BaseModel):
    state: dict[str, Any]
    message: str


class ChatResponse(BaseModel):
    response: str
    end: bool = False
    state: dict[str, Any] | None = None


@router.post("/post_patient_message", response_model=ChatResponse)
async def send_message_to_chatbot(payload: ChatRequest):
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            upstream_response = await client.post(
                UPSTREAM_CHATBOT_URL,
                json={
                    "state": payload.state,
                    "message": payload.message,
                },
            )

        upstream_response.raise_for_status()
        data = upstream_response.json()

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Upstream chatbot timed out")
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Upstream chatbot returned error {e.response.status_code}",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to upstream chatbot service",
        )
    except ValueError:
        raise HTTPException(
            status_code=502,
            detail="Upstream chatbot returned invalid JSON",
        )

    if "response" not in data and "message" not in data:
        raise HTTPException(
            status_code=502,
            detail="Upstream chatbot response missing 'response' or 'message' field",
        )

    return ChatResponse(
        response=data.get("response") or data.get("message"),
        end=bool(data.get("end", False)),
        state=data.get("state"),
    )