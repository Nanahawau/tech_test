from fastapi import APIRouter, HTTPException, status

from models.auth import LoginRequest, TokenResponse
from services.auth.config import get_auth_settings
from services.auth.jwt import authenticate_default_user, validate_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/token", response_model=TokenResponse)
def token(body: LoginRequest) -> TokenResponse:
    settings = get_auth_settings()

    if not authenticate_default_user(settings=settings, email=body.email, password=body.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token, expires_in = validate_user(settings=settings, subject=body.email)
    return TokenResponse(access_token=access_token, token_type="bearer", expires_in=expires_in, email=body.email)