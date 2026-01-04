from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from services.auth.config import get_auth_settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def get_current_email(token: str = Depends(oauth2_scheme)) -> str:
    settings = get_auth_settings()

    unauth = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        sub = payload.get("sub")
        if not isinstance(sub, str) or not sub:
            raise unauth
        return sub
    except JWTError:
        raise unauth