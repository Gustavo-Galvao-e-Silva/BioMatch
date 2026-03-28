from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/health")
def user_routes_health():
    return {"status": "ok"}
