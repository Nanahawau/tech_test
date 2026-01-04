from fastapi import HTTPException

from models.account_aggregate import AccountAggregate
from services.store import STORE


def get_accounts_or_404() -> list[AccountAggregate]:

    if not STORE.accounts:
        raise HTTPException(status_code=404, detail="No ingested data available. Ingest a CSV first.")
    return list(STORE.accounts.values())