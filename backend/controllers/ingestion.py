from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException

from models.api_responses import ApiSuccessResponse, IngestionResult
from services.csv_ingestion import ingest_bytes, ingest_path
from services.store import STORE
from services.auth.dependencies import get_current_email

router = APIRouter(prefix="/api/ingest", tags=["ingestion"], dependencies=[Depends(get_current_email)])

STARTER_CSV = Path(__file__).resolve().parents[2] / "sample_data.csv"


@router.post("", response_model=ApiSuccessResponse[IngestionResult])
async def ingest_csv(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=422, detail="Missing filename")

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=422, detail="Only .csv uploads are supported")

    csv_bytes = await file.read()
    if not csv_bytes:
        raise HTTPException(status_code=422, detail="Uploaded file is empty")

    ingest_bytes(csv_bytes, source=f"upload:{file.filename}")
    return {"status": True, "data": {"ok": True, "records_loaded": len(STORE.accounts)}}


@router.post("/reload", response_model=ApiSuccessResponse[IngestionResult])
def reload_from_sample_csv():
    if not STARTER_CSV.exists():
        raise HTTPException(status_code=404, detail=f"Starter CSV not found at {STARTER_CSV}")
    ingest_path(STARTER_CSV, source=f"starter:{STARTER_CSV.name}")
    return {"status": True, "data": {"ok": True, "records_loaded": len(STORE.accounts)}}