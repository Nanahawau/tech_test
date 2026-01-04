from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from models.account_aggregate import AccountAggregate


@dataclass
class InMemoryStore:
    accounts: dict[UUID, AccountAggregate] = field(default_factory=dict)
    row_errors: list[dict] = field(default_factory=list)
    conflicts: list[dict] = field(default_factory=list)

    expected_headers: list[str] = field(default_factory=list)

    source: Optional[str] = None
    loaded_at: Optional[str] = None  # ISO string

    def set(self, *, source: str) -> None:
        self.source = source
        self.loaded_at = datetime.now(timezone.utc).isoformat()



STORE = InMemoryStore()