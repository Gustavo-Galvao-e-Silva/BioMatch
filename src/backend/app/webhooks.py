import os

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from svix.webhooks import Webhook, WebhookVerificationError

from app.database import get_db
from app.models import User

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def _clerk_primary_email(data: dict) -> str | None:
    addresses = data.get("email_addresses") or []
    primary_id = data.get("primary_email_address_id")
    for item in addresses:
        if item.get("id") == primary_id:
            return item.get("email_address")
    if addresses:
        return addresses[0].get("email_address")
    return None


def _clerk_primary_phone(data: dict) -> str | None:
    numbers = data.get("phone_numbers") or []
    primary_id = data.get("primary_phone_number_id")
    for item in numbers:
        if item.get("id") == primary_id:
            return item.get("phone_number")
    if numbers:
        return numbers[0].get("phone_number")
    return None


def _clerk_full_name(data: dict) -> str:
    first = (data.get("first_name") or "").strip()
    last = (data.get("last_name") or "").strip()
    full = f"{first} {last}".strip()
    if full:
        return full[:255]
    username = data.get("username")
    if username:
        return str(username)[:255]
    return "User"


def _user_fields_from_clerk(data: dict) -> dict:
    return {
        "clerk_user_id": data["id"],
        "email": _clerk_primary_email(data),
        "phone_number": _clerk_primary_phone(data),
        "full_name": _clerk_full_name(data),
    }


def _sync_user_from_clerk(db: Session, data: dict) -> tuple[User, bool]:
    fields = _user_fields_from_clerk(data)
    clerk_user_id = fields["clerk_user_id"]

    user = db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    ).scalar_one_or_none()

    if user:
        user.email = fields["email"]
        user.phone_number = fields["phone_number"]
        user.full_name = fields["full_name"]
        db.commit()
        db.refresh(user)
        return user, False

    user = User(
        clerk_user_id=clerk_user_id,
        email=fields["email"],
        phone_number=fields["phone_number"],
        full_name=fields["full_name"],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user, True

@router.post("/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    clerk_webhook_secret = os.getenv("CLERK_WEBHOOK_SECRET")

    if not clerk_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="CLERK_WEBHOOK_SECRET is not configured",
        )

    payload_bytes = await request.body()

    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    if not svix_id or not svix_timestamp or not svix_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Svix headers",
        )

    headers = {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
    }

    try:
        wh = Webhook(clerk_webhook_secret)
        event = wh.verify(payload_bytes, headers)
    except WebhookVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature",
        )

    event_type = event.get("type")
    data = event.get("data", {})

    if event_type in ("user.created", "user.updated"):
        user, created = _sync_user_from_clerk(db, data)

        if event_type == "user.created" and not created:
            return {
                "status": "ok",
                "message": "User already exists",
                "user_id": user.id,
            }

        return {
            "status": "ok",
            "message": "User created" if created else "User updated",
            "user_id": user.id,
        }