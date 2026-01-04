from enum import Enum
from typing import Literal, Optional, TypedDict, Union, Any

from fastapi import HTTPException

from models.subscription import SubscriptionStatus
from services.insights.repository import get_accounts_or_404



_HIGH_SEATS = 10
_LOW_ACTIVITY_MESSAGES = 5
_LOW_ACTIVITY_NOTIFICATIONS = 5
_HIGH_ACTIVITY_NOTIFICATIONS = 200
_LOW_SEATS = 2

class LeadershipAnalytics(TypedDict):
    accounts_total: int
    accounts_active: int
    accounts_inactive: int
    workflows_total: int
    workflow_titles_unique: int
    automation_count_total: int
    messages_processed_total: int
    notifications_sent_total: int
    notifications_billed_total: int
    notifications_billed_ratio: Optional[float]


class LeadershipSummary(TypedDict):
    analytics: LeadershipAnalytics


class AccountRef(TypedDict):
    account_uuid: str
    account_label: str


class ActionList(TypedDict):
    reason: str
    recommended_actions: list[str]
    items: list[AccountRef]

class AccountManagerAnalytics(TypedDict):
    accounts_total: int
    inactive_with_usage_count: int
    active_zero_activity_count: int
    seats_vs_usage_mismatch_count: int
    billed_vs_sent_anomalies_count: int


class AccountManagerActionLists(TypedDict):
    inactive_with_usage: ActionList
    active_zero_activity: ActionList
    seats_vs_usage_mismatch: ActionList
    billed_vs_sent_anomalies: ActionList


class AccountManagerSummary(TypedDict):
    analytics: AccountManagerAnalytics
    action_lists: AccountManagerActionLists


Summary = Union[LeadershipSummary, AccountManagerSummary]


class Audience(str, Enum):
    leadership = "leadership"
    account_manager = "account_manager"


def leadership_summary() -> LeadershipSummary:
    accounts = get_accounts_or_404()

    total_accounts = len(accounts)
    active_accounts = sum(1 for a in accounts if a.subscription.status == SubscriptionStatus.active)
    inactive_accounts = total_accounts - active_accounts

    workflows_total = sum(len(a.workflows) for a in accounts)
    workflow_titles_unique = len({w.title for a in accounts for w in a.workflows})

    automation_count_total = sum(a.usage.automation_count for a in accounts)
    messages_processed_total = sum(a.usage.messages_processed for a in accounts)
    notifications_sent_total = sum(a.usage.notifications_sent for a in accounts)
    notifications_billed_total = sum(a.usage.notifications_billed for a in accounts)

    billed_ratio = (
        (notifications_billed_total / notifications_sent_total) if notifications_sent_total > 0 else None
    )

    return {
        "analytics": {
            "accounts_total": total_accounts,
            "accounts_active": active_accounts,
            "accounts_inactive": inactive_accounts,
            "workflows_total": workflows_total,
            "workflow_titles_unique": workflow_titles_unique,
            "automation_count_total": automation_count_total,
            "messages_processed_total": messages_processed_total,
            "notifications_sent_total": notifications_sent_total,
            "notifications_billed_total": notifications_billed_total,
            "notifications_billed_ratio": billed_ratio,
        },
    }

def _account_ref(a) -> AccountRef:
    return {
        "account_uuid": str(a.account.account_uuid),
        "account_label": a.account.account_label,
    }


def _total_seats(a) -> int:
    return a.subscription.admin_seats + a.subscription.user_seats + a.subscription.read_only_seats


def _is_inactive_with_usage(a) -> bool:
    return a.subscription.status == SubscriptionStatus.inactive and (
        a.usage.messages_processed > 0
        or a.usage.notifications_sent > 0
        or a.usage.notifications_billed > 0
    )


def _is_active_zero_activity(a) -> bool:
    return (
        a.subscription.status == SubscriptionStatus.active
        and a.usage.messages_processed == 0
        and a.usage.notifications_sent == 0
        and a.usage.automation_count == 0
    )


def _is_seats_vs_usage_mismatch(a) -> bool:
    if a.subscription.status != SubscriptionStatus.active:
        return False

    seats = _total_seats(a)

    adoption_risk = (
        seats >= _HIGH_SEATS
        and a.usage.messages_processed <= _LOW_ACTIVITY_MESSAGES
        and a.usage.notifications_sent <= _LOW_ACTIVITY_NOTIFICATIONS
        and a.usage.automation_count == 0
    )

    expansion_opportunity = seats <= _LOW_SEATS and a.usage.notifications_sent >= _HIGH_ACTIVITY_NOTIFICATIONS

    return adoption_risk or expansion_opportunity


def _is_billed_vs_sent_anomaly(a) -> bool:
    # Only meaningful if we actually sent notifications
    if a.usage.notifications_sent <= 0:
        return False

    return a.usage.notifications_billed == 0 or a.usage.notifications_billed > a.usage.notifications_sent


def _build_action_list(*, reason: str, recommended_actions: list[str], accounts) -> ActionList:
    return {
        "reason": reason,
        "recommended_actions": recommended_actions,
        "items": [_account_ref(a) for a in accounts],
    }


def account_manager_summary() -> AccountManagerSummary:
    accounts = get_accounts_or_404()

    inactive_with_usage_accounts = [a for a in accounts if _is_inactive_with_usage(a)]
    active_zero_activity_accounts = [a for a in accounts if _is_active_zero_activity(a)]
    seats_vs_usage_mismatch_accounts = [a for a in accounts if _is_seats_vs_usage_mismatch(a)]
    billed_vs_sent_anomalies_accounts = [a for a in accounts if _is_billed_vs_sent_anomaly(a)]

    return {
        "analytics": {
            "accounts_total": len(accounts),
            "inactive_with_usage_count": len(inactive_with_usage_accounts),
            "active_zero_activity_count": len(active_zero_activity_accounts),
            "seats_vs_usage_mismatch_count": len(seats_vs_usage_mismatch_accounts),
            "billed_vs_sent_anomalies_count": len(billed_vs_sent_anomalies_accounts),
        },
        "action_lists": {
            "inactive_with_usage": _build_action_list(
                reason="Subscription is inactive but usage signals are > 0.",
                recommended_actions=[
                    "Confirm whether usage reflects recent activity or data lag.",
                    "Reach out to renew/reactivate if activity is expected.",
                    "Check billing/notification rules if billed > 0 while inactive.",
                ],
                accounts=inactive_with_usage_accounts,
            ),
            "active_zero_activity": _build_action_list(
                reason="Subscription is active but there is no measured activity (messages/notifications/automation).",
                recommended_actions=[
                    "Verify onboarding completed (workflows configured, users added).",
                    "Schedule enablement/training; validate integrations are connected.",
                    "Identify first-use workflow and set activation goal.",
                ],
                accounts=active_zero_activity_accounts,
            ),
            "seats_vs_usage_mismatch": _build_action_list(
                reason="Seat allocation appears inconsistent with observed usage (heuristic).",
                recommended_actions=[
                    "If high seats + low activity: identify activation blockers and schedule enablement.",
                    "If low seats + high activity: discuss expansion/licensing needs.",
                ],
                accounts=seats_vs_usage_mismatch_accounts,
            ),
            "billed_vs_sent_anomalies": _build_action_list(
                reason="Notifications billed vs sent appears inconsistent (heuristic).",
                recommended_actions=[
                    "If sent > 0 and billed == 0: review billing configuration/rules.",
                    "If billed > sent: verify definitions and data pipeline correctness.",
                ],
                accounts=billed_vs_sent_anomalies_accounts,
            ),
        },
    }

def get_summary(*, audience: Audience) -> Summary:
    if audience == Audience.leadership:
        return leadership_summary()
    if audience == Audience.account_manager:
        return account_manager_summary()
    raise HTTPException(status_code=422, detail="Invalid audience.")