import json
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response


def _error_payload(message: str, details: Any = None) -> dict[str, Any]:
    err = {"message": message}
    if details is not None:
        err["details"] = details
    return err


class UniformResponseMiddleware(BaseHTTPMiddleware):
    
    def __init__(self, app: Any, *, exclude_paths: set[str] | None = None) -> None:
        super().__init__(app)
        self.exclude_paths = exclude_paths or {"/openapi.json", "/docs", "/redoc"}

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        if request.url.path in self.exclude_paths:
            return response

        if response.status_code >= 400:
            return response

        content_type = (response.headers.get("content-type") or "").lower()
        if "application/json" not in content_type:
            return response

        # Read the original JSON body
        body = b""
        async for chunk in response.body_iterator:
            body += chunk

        if not body:
            return JSONResponse(status_code=response.status_code, content={"status": True, "data": None})

        try:
            original = json.loads(body.decode("utf-8"))
        except Exception:
            # If it isn't valid JSON, return it unchanged
            return Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.media_type,
            )

        # Avoid double-wrapping if already shaped
        if isinstance(original, dict) and "status" in original and ("data" in original or "error" in original):
            return JSONResponse(status_code=response.status_code, content=original)

        return JSONResponse(status_code=response.status_code, content={"status": True, "data": original})


def install_response_handling(app: FastAPI) -> None:
    # Success wrapper
    app.add_middleware(UniformResponseMiddleware)

    # Error formatting
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        # exc.detail can be str or dict; keep as details when dict-like
        if isinstance(exc.detail, str):
            error = _error_payload(exc.detail)
        else:
            error = _error_payload("Request failed", details=exc.detail)

        return JSONResponse(status_code=exc.status_code, content={"status": False, "data": None, "error": error})

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "status": False,
                "data": None,
                "error": _error_payload("Validation error", details=exc.errors()),
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"status": False, "data": None, "error": _error_payload("Internal server error")},
        )