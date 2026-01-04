import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt

from services.auth.config import AuthSettings


def authenticate_default_user(*, settings: AuthSettings, email: str, password: str) -> bool:
    return secrets.compare_digest(email, settings.default_email) and secrets.compare_digest(
        password, settings.default_password
    )


def validate_user(
    *,
    settings: AuthSettings,
    subject: str,
    expires_minutes: Optional[int] = None,
) -> tuple[str, int]:
    exp_minutes = expires_minutes or settings.access_token_exp_minutes
    expires_in_seconds = int(timedelta(minutes=exp_minutes).total_seconds())

    exp = datetime.now(timezone.utc) + timedelta(minutes=exp_minutes)
    payload = {"sub": subject, "exp": exp}
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, expires_in_seconds