import os
from dataclasses import dataclass


@dataclass(frozen=True)
class AuthSettings:
    jwt_secret_key: str
    jwt_algorithm: str
    access_token_exp_minutes: int
    default_email: str
    default_password: str


def get_auth_settings() -> AuthSettings:
    return AuthSettings(
        jwt_secret_key=os.getenv("JWT_SECRET_KEY", ""),
        jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        access_token_exp_minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")),
        default_email=os.getenv("DEFAULT_AUTH_EMAIL", "test@gmail.com"),
        default_password=os.getenv("DEFAULT_AUTH_PASSWORD", "test"),
    )