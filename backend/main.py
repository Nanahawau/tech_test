# main.py (FastAPI starter)
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
import logging
from fastapi.middleware.cors import CORSMiddleware

from controllers.ingestion import router as ingestion_router
from controllers.insights import router as insights_router
from controllers.auth import router as auth_router
from services.csv_ingestion import init_expected_headers_from_starter, ingest_path
from common.response import install_response_handling
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)

STARTER_CSV = Path(__file__).resolve().parent / "sample_data.csv"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_expected_headers_from_starter(STARTER_CSV)
    ingest_path(STARTER_CSV, source=f"startup:{STARTER_CSV.name}")
    yield



app = FastAPI(lifespan=lifespan)
install_response_handling(app)

origins = [
    "http://localhost",
    "http://localhost:4200",
    "http://127.0.0.1",
    "http://127.0.0.1:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingestion_router)
app.include_router(insights_router)
app.include_router(auth_router)


app.get("/")
def root():
    return {"message": "Welcome to the Custome insights backend!"}   

@app.get("/health")
def health():
    if not STARTER_CSV.exists():
        raise HTTPException(status_code=503, detail=f"sample_data.csv not found at {STARTER_CSV}")
    return {"exists": True, "path": str(STARTER_CSV)}