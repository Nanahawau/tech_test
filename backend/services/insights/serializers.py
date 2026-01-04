from typing import TypedDict

from models.account_aggregate import AccountAggregate


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


def account_to_record(a: AccountAggregate) -> AccountRecord:
    return {
        "account_uuid": str(a.account.account_uuid),
        "account_label": a.account.account_label,
        "subscription": {
            "status": a.subscription.status.value,
            "admin_seats": a.subscription.admin_seats,
            "user_seats": a.subscription.user_seats,
            "read_only_seats": a.subscription.read_only_seats,
        },
        "usage": {
            "total_records": a.usage.total_records,
            "automation_count": a.usage.automation_count,
            "messages_processed": a.usage.messages_processed,
            "notifications_sent": a.usage.notifications_sent,
            "notifications_billed": a.usage.notifications_billed,
        },
        "workflows": {
            "count": len(a.workflows),
            "titles": [w.title for w in a.workflows],
        },
    }