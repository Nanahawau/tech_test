import csv
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from uuid import UUID

from pydantic import ValidationError

from models.account import Account
from models.account_aggregate import AccountAggregate
from models.subscription import Subscription
from models.usage import Usage
from models.workflow import Workflow

logger = logging.getLogger(__name__)

# Required columns for a row to be ingested (non-blank)
REQUIRED_FIELDS: list[str] = [
    "Account UUID",
    "Account Label",
    "Subscription Status",
    "Admin Seats",
    "User Seats",
    "Read Only Seats",
    "Total Records",
    "Automation Count",
    "Messages Processed",
    "Notifications Sent",
    "Notifications Billed",
]

# Optional columns: This was decided because the sample csv has a blank workflow title
OPTIONAL_FIELDS: set[str] = {
    "Workflow Title",
}


@dataclass(frozen=True)
class RowError:
    row_number: int
    message: str
    raw: dict[str, Any]


@dataclass(frozen=True)
class ConflictError:
    account_uuid: str
    row_number: int
    field: str
    expected: Any
    got: Any


def _is_blank(value: Any) -> bool:
    return value is None or (isinstance(value, str) and value.strip() == "")


def _missing_required_fields(row: dict[str, Any]) -> list[str]:
    missing: list[str] = []
    for field in REQUIRED_FIELDS:
        if field not in row or _is_blank(row.get(field)):
            missing.append(field)
    return missing


def _workflow_from_row(row: dict[str, Any]) -> Workflow | None:
    title = (row.get("Workflow Title") or "").strip()
    if not title:
        return None
    return Workflow(title=title)


def _normalize_row(row: dict[str, Any]) -> dict[str, Any]:
    normalized: dict[str, Any] = {}
    for k, v in row.items():
        if isinstance(v, str):
            normalized[k] = v.strip()
        else:
            normalized[k] = v
    return normalized


def _parse_row_models(row: dict[str, Any]) -> tuple[Account, Subscription, Usage, Workflow | None]:
    account = Account(
        account_uuid=row["Account UUID"],
        account_label=row["Account Label"],
    )
    subscription = Subscription(
        status=row["Subscription Status"],
        admin_seats=row["Admin Seats"],
        user_seats=row["User Seats"],
        read_only_seats=row["Read Only Seats"],
    )
    usage = Usage(
        total_records=row["Total Records"],
        automation_count=row["Automation Count"],
        messages_processed=row["Messages Processed"],
        notifications_sent=row["Notifications Sent"],
        notifications_billed=row["Notifications Billed"],
    )
    workflow = _workflow_from_row(row)
    return account, subscription, usage, workflow


def _record_conflict(
    *,
    conflicts: list[ConflictError],
    account_uuid: UUID,
    row_number: int,
    field: str,
    expected: Any,
    got: Any,
) -> None:
    if expected == got:
        return

    ce = ConflictError(
        account_uuid=str(account_uuid),
        row_number=row_number,
        field=field,
        expected=expected,
        got=got,
    )
    conflicts.append(ce)
    logger.warning(
        "CSV conflict (first row wins): account_uuid=%s row=%d field=%s expected=%r got=%r",
        ce.account_uuid,
        ce.row_number,
        ce.field,
        ce.expected,
        ce.got,
    )


def load_and_aggregate(
    csv_path: Path,
) -> tuple[dict[UUID, AccountAggregate], list[RowError], list[ConflictError]]:
    accounts: dict[UUID, AccountAggregate] = {}
    row_errors: list[RowError] = []
    conflicts: list[ConflictError] = []

    with csv_path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)

        if not reader.fieldnames:
            msg = "CSV has no header row"
            logger.warning(msg)
            row_errors.append(RowError(row_number=1, message=msg, raw={}))
            return accounts, row_errors, conflicts

        for row_number, raw_row in enumerate(reader, start=2):
            row = _normalize_row(raw_row)

            missing = _missing_required_fields(row)
            if missing:
                msg = f"Missing required fields: {', '.join(missing)}"
                row_errors.append(RowError(row_number=row_number, message=msg, raw=row))
                logger.warning("Dropping row %d: %s", row_number, msg)
                continue

            try:
                account, subscription, usage, workflow = _parse_row_models(row)
            except (KeyError, ValidationError) as e:
                msg = str(e)
                row_errors.append(RowError(row_number=row_number, message=msg, raw=row))
                logger.warning("Dropping row %d due to validation error: %s", row_number, msg)
                continue

            existing = accounts.get(account.account_uuid)
            if existing is None:
                agg = AccountAggregate(account=account, subscription=subscription, usage=usage, workflows=[])
                if workflow:
                    agg.workflows.append(workflow)
                accounts[account.account_uuid] = agg
                continue

            # First row wins: log conflicts, do not overwrite existing values.
            comparisons: list[tuple[str, Any, Any]] = [
                ("account_label", existing.account.account_label, account.account_label),
                ("subscription.status", existing.subscription.status, subscription.status),
                ("subscription.admin_seats", existing.subscription.admin_seats, subscription.admin_seats),
                ("subscription.user_seats", existing.subscription.user_seats, subscription.user_seats),
                ("subscription.read_only_seats", existing.subscription.read_only_seats, subscription.read_only_seats),
                ("usage.total_records", existing.usage.total_records, usage.total_records),
                ("usage.automation_count", existing.usage.automation_count, usage.automation_count),
                ("usage.messages_processed", existing.usage.messages_processed, usage.messages_processed),
                ("usage.notifications_sent", existing.usage.notifications_sent, usage.notifications_sent),
                ("usage.notifications_billed", existing.usage.notifications_billed, usage.notifications_billed),
            ]
            for field, expected, got in comparisons:
                _record_conflict(
                    conflicts=conflicts,
                    account_uuid=account.account_uuid,
                    row_number=row_number,
                    field=field,
                    expected=expected,
                    got=got,
                )

            if workflow:
                existing_titles = {w.title for w in existing.workflows}
                if workflow.title not in existing_titles:
                    existing.workflows.append(workflow)

    return accounts, row_errors, conflicts