import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from svix.webhooks import Webhook, WebhookVerificationError

from app.database import get_db
from app.models import User

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")


@router.post("/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    if not CLERK_WEBHOOK_SECRET:
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
        wh = Webhook(CLERK_WEBHOOK_SECRET)
        event = wh.verify(payload_bytes, headers)
    except WebhookVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature",
        )

    event_type = event.get("type")
    data = event.get("data", {})

    if event_type == "user.created":
        clerk_user_id = data["id"]

        email = None
        email_addresses = data.get("email_addresses", [])
        primary_email_id = data.get("primary_email_address_id")

        for item in email_addresses:
            if item.get("id") == primary_email_id:
                email = item.get("email_address")
                break

        if email is None and email_addresses:
            email = email_addresses[0].get("email_address")

        first_name = data.get("first_name") or ""
        last_name = data.get("last_name") or ""
        full_name = f"{first_name} {last_name}".strip()

        if not full_name:
            username = data.get("username")
            full_name = username or "User"

        existing = db.execute(
            select(User).where(User.clerk_user_id == clerk_user_id)
        ).scalar_one_or_none()

        if existing:
            return {
                "status": "ok",
                "message": "User already exists",
                "user_id": existing.id,
            }

        user = User(
            clerk_user_id=clerk_user_id,
            email=email,
            full_name=full_name,
            role="user",
            created_at=datetime.utcnow(),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "status": "ok",
            "message": "User created",
            "user_id": user.id,
        }

    return {
        "status": "ok",
        "message": f"Ignored event {event_type}",
    }