import math
from enum import Enum
from typing import Any, Optional, TypedDict

from fastapi import HTTPException

from models.account_aggregate import AccountAggregate
from models.subscription import SubscriptionStatus
from services.insights.repository import get_accounts_or_404
from services.insights.serializers import account_to_record


class SubscriptionRecord(TypedDict):
    status: str
    admin_seats: int
    user_seats: int
    read_only_seats: int


class UsageRecord(TypedDict):
    total_records: int
    automation_count: int
    messages_processed: int
    notifications_sent: int
    notifications_billed: int


class WorkflowsRecord(TypedDict):
    count: int
    titles: list[str]


class AccountRecord(TypedDict):
    account_uuid: str
    account_label: str
    subscription: SubscriptionRecord
    usage: UsageRecord
    workflows: WorkflowsRecord


class AccountsPage(TypedDict):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    items: list[AccountRecord]


class SortBy(str, Enum):
    account_label = "account_label"
    notifications_billed = "notifications_billed"
    notifications_sent = "notifications_sent"
    messages_processed = "messages_processed"
    total_records = "total_records"
    automation_count = "automation_count"


class SortDir(str, Enum):
    asc = "asc"
    desc = "desc"


def _validate_paging(page: int, page_size: int) -> None:
    if page < 1:
        raise HTTPException(status_code=422, detail="'page' must be >= 1")
    if page_size < 1 or page_size > 200:
        raise HTTPException(status_code=422, detail="'page_size' must be between 1 and 200")


def _parse_status(status: Optional[str]) -> Optional[SubscriptionStatus]:
    if status is None:
        return None
    try:
        return SubscriptionStatus(status.strip().lower())
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid 'status'. Expected: active|inactive.")


def _filter_accounts(
    accounts: list[AccountAggregate],
    *,
    account_uuid: str,
    status: Optional[str],
    search: Optional[str],
    workflow_title: Optional[str],
) -> list[AccountAggregate]:
    status_enum = _parse_status(status)

    result = accounts

    if account_uuid:
        a = account_uuid.strip().lower()
        result = [a for a in result if str(a.account.account_uuid) == account_uuid]

    if status_enum is not None:
        result = [a for a in result if a.subscription.status == status_enum]

    if search:
        s = search.strip().lower()
        result = [a for a in result if s in a.account.account_label.lower()]

    if workflow_title:
        wt = workflow_title.strip().lower()
        result = [a for a in result if any(w.title.lower() == wt for w in a.workflows)]

    return result


def _sort_accounts(
    accounts: list[AccountAggregate],
    *,
    sort_by: SortBy,
    sort_dir: SortDir,
) -> list[AccountAggregate]:
    reverse = sort_dir == SortDir.desc

    if sort_by == SortBy.account_label:
        return sorted(accounts, key=lambda a: a.account.account_label.lower(), reverse=reverse)
    if sort_by == SortBy.notifications_billed:
        return sorted(accounts, key=lambda a: a.usage.notifications_billed, reverse=reverse)
    if sort_by == SortBy.notifications_sent:
        return sorted(accounts, key=lambda a: a.usage.notifications_sent, reverse=reverse)
    if sort_by == SortBy.messages_processed:
        return sorted(accounts, key=lambda a: a.usage.messages_processed, reverse=reverse)
    if sort_by == SortBy.total_records:
        return sorted(accounts, key=lambda a: a.usage.total_records, reverse=reverse)
    if sort_by == SortBy.automation_count:
        return sorted(accounts, key=lambda a: a.usage.automation_count, reverse=reverse)

    return accounts


def get_records(
    *,
    page: int = 1,
    page_size: int = 25,
    status: Optional[str] = None,
    account_uuid: Optional[str] = None,
    search: Optional[str] = None,
    workflow_title: Optional[str] = None,
    sort_by: SortBy = SortBy.account_label,
    sort_dir: SortDir = SortDir.asc,
) -> AccountsPage:
    _validate_paging(page, page_size)

    accounts = get_accounts_or_404()
    accounts = _filter_accounts(accounts, account_uuid=account_uuid, status=status, search=search, workflow_title=workflow_title)
    accounts = _sort_accounts(accounts, sort_by=sort_by, sort_dir=sort_dir)

    total_items = len(accounts)
    total_pages = max(1, math.ceil(total_items / page_size))
    start = (page - 1) * page_size
    end = start + page_size
    page_items = accounts[start:end]

    return {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "items": [account_to_record(a) for a in page_items],  
    }