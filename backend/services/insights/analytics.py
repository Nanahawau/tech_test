from collections import Counter
from typing import TypedDict

from fastapi import HTTPException

from models.subscription import SubscriptionStatus
from services.insights.repository import get_accounts_or_404


class ChartData(TypedDict):
    labels: list[str]
    values: list[int]


class UsageTotals(TypedDict):
    accounts: int
    automation_count_total: int
    messages_processed_total: int
    notifications_sent_total: int
    notifications_billed_total: int
    total_records_total: int


class UsageBySubscriptionStatus(TypedDict):
    active: UsageTotals
    inactive: UsageTotals


def subscriptions_by_status() -> ChartData:
    accounts = get_accounts_or_404()
    active = sum(1 for a in accounts if a.subscription.status == SubscriptionStatus.active)
    inactive = len(accounts) - active
    return {"labels": ["active", "inactive"], "values": [active, inactive]}


def notifications_sent_vs_billed() -> ChartData:
    accounts = get_accounts_or_404()
    sent = sum(a.usage.notifications_sent for a in accounts)
    billed = sum(a.usage.notifications_billed for a in accounts)
    return {"labels": ["sent", "billed"], "values": [sent, billed]}


def top_workflows(*, limit: int = 10) -> ChartData:
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=422, detail="'limit' must be between 1 and 100")

    accounts = get_accounts_or_404()
    titles = [w.title for a in accounts for w in a.workflows]
    top = Counter(titles).most_common(limit)
    return {"labels": [t for t, _ in top], "values": [c for _, c in top]}


def usage_by_subscription_status() -> UsageBySubscriptionStatus:
    accounts = get_accounts_or_404()

    def totals(status: SubscriptionStatus) -> UsageTotals:
        xs = [a for a in accounts if a.subscription.status == status]
        return {
            "accounts": len(xs),
            "automation_count_total": sum(a.usage.automation_count for a in xs),
            "messages_processed_total": sum(a.usage.messages_processed for a in xs),
            "notifications_sent_total": sum(a.usage.notifications_sent for a in xs),
            "notifications_billed_total": sum(a.usage.notifications_billed for a in xs),
            "total_records_total": sum(a.usage.total_records for a in xs),
        }

    return {"active": totals(SubscriptionStatus.active), "inactive": totals(SubscriptionStatus.inactive)}