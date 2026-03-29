from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


UPSTREAM_CHATBOT_URL = "http://127.0.0.1:9000/chat"


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    end: bool = False


@router.post("/post_patient_message", response_model=ChatResponse)
async def send_message_to_chatbot(payload: ChatRequest):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            upstream_response = await client.post(
                UPSTREAM_CHATBOT_URL,
                json={"message": payload.message},
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

    if "response" not in data:
        raise HTTPException(
            status_code=502,
            detail="Upstream chatbot response missing 'response' field",
        )

    return ChatResponse(
        response=data["response"],
        end=bool(data.get("end", False)),
    )