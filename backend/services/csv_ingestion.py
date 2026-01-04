import csv
import io
from pathlib import Path

from fastapi import HTTPException

from services.store import STORE
from services.aggregation import load_and_aggregate


def _read_headers(csv_bytes: bytes) -> list[str]:
    text = csv_bytes.decode("utf-8-sig")  # handles BOM if present
    reader = csv.reader(io.StringIO(text))
    try:
        headers = next(reader)
    except StopIteration:
        return []
    return [h.strip() for h in headers]


def _validate_headers_or_422(headers: list[str], expected: list[str]) -> None:
    headers_present = [h for h in headers if h]  
    if not headers_present:
        raise HTTPException(status_code=422, detail="CSV has no header row")

    expected_set = set(expected)
    headers_present_set = set(headers_present)

    missing = sorted(expected_set - headers_present_set)
    extra = sorted(headers_present_set - expected_set)

    if missing or extra:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "CSV headers do not match expected schema",
                "missing": missing,
                "extra": extra,
                "expected": expected,
                "headers_present": headers_present,
            },
        )


def init_expected_headers_from_starter(starter_csv_path: Path) -> None:
    starter_bytes = starter_csv_path.read_bytes()
    STORE.expected_headers = _read_headers(starter_bytes)


def ingest_bytes(csv_bytes: bytes, *, source: str) -> None:
    headers = _read_headers(csv_bytes)
    _validate_headers_or_422(headers, STORE.expected_headers)

    tmp_path = Path(__file__).resolve().parents[1] / ".ingested.csv"
    tmp_path.write_bytes(csv_bytes)

    accounts, row_errors, conflicts = load_and_aggregate(tmp_path)

    STORE.accounts.update(accounts)

    STORE.row_errors.clear()
    STORE.row_errors.extend(e.__dict__ for e in row_errors)

    STORE.conflicts.clear()
    STORE.conflicts.extend(c.__dict__ for c in conflicts)

    STORE.set(source=source)


def ingest_path(csv_path: Path, *, source: str) -> None:
    ingest_bytes(csv_path.read_bytes(), source=source)