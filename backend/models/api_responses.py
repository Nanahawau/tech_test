from typing import Any, Generic, Literal, Optional, TypeVar, Union

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")

class TokenResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(ge=1)

class ApiSuccessResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(extra="forbid")

    status: Literal[True] = True
    data: T

class IngestionResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    ok: bool
    records_loaded: int = Field(ge=0)


class LeadershipAnalytics(BaseModel):
    model_config = ConfigDict(extra="forbid")

    accounts_total: int = Field(ge=0)
    accounts_active: int = Field(ge=0)
    accounts_inactive: int = Field(ge=0)
    workflows_total: int = Field(ge=0)
    workflow_titles_unique: int = Field(ge=0)
    automation_count_total: int = Field(ge=0)
    messages_processed_total: int = Field(ge=0)
    notifications_sent_total: int = Field(ge=0)
    notifications_billed_total: int = Field(ge=0)
    notifications_billed_ratio: Optional[float] = None


class LeadershipSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    analytics: LeadershipAnalytics


class AccountManagerAnalytics(BaseModel):
    model_config = ConfigDict(extra="forbid")

    accounts_total: int = Field(ge=0)
    inactive_with_usage_count: int = Field(ge=0)
    active_zero_activity_count: int = Field(ge=0)


class AccountRef(BaseModel):
    model_config = ConfigDict(extra="forbid")

    account_uuid: str
    account_label: str


class ActionList(BaseModel):
    model_config = ConfigDict(extra="forbid")

    reason: str
    recommended_actions: list[str]
    items: list[AccountRef]


class AccountManagerAnalytics(BaseModel):
    model_config = ConfigDict(extra="forbid")

    accounts_total: int = Field(ge=0)
    inactive_with_usage_count: int = Field(ge=0)
    active_zero_activity_count: int = Field(ge=0)
    seats_vs_usage_mismatch_count: int = Field(ge=0)
    billed_vs_sent_anomalies_count: int = Field(ge=0)


class AccountManagerActionLists(BaseModel):
    model_config = ConfigDict(extra="forbid")

    inactive_with_usage: ActionList
    active_zero_activity: ActionList
    seats_vs_usage_mismatch: ActionList
    billed_vs_sent_anomalies: ActionList


class AccountManagerSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    analytics: AccountManagerAnalytics
    action_lists: AccountManagerActionLists
    notes: Optional[list[str]] = None



SummaryData = Union[LeadershipSummary, AccountManagerSummary]

class SubscriptionDTO(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str
    admin_seats: int = Field(ge=0)
    user_seats: int = Field(ge=0)
    read_only_seats: int = Field(ge=0)


class UsageDTO(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total_records: int = Field(ge=0)
    automation_count: int = Field(ge=0)
    messages_processed: int = Field(ge=0)
    notifications_sent: int = Field(ge=0)
    notifications_billed: int = Field(ge=0)


class WorkflowsDTO(BaseModel):
    model_config = ConfigDict(extra="forbid")

    count: int = Field(ge=0)
    titles: list[str]


class AccountRecordDTO(BaseModel):
    model_config = ConfigDict(extra="forbid")

    account_uuid: str
    account_label: str
    subscription: SubscriptionDTO
    usage: UsageDTO
    workflows: WorkflowsDTO


class AccountsPageDTO(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=200)
    total_items: int = Field(ge=0)
    total_pages: int = Field(ge=1)
    items: list[AccountRecordDTO]


class ChartDTO(BaseModel):
    model_config = ConfigDict(extra="forbid")

    labels: list[str]
    values: list[int]


class UsageTotalsDTO(BaseModel):
    model_config = ConfigDict(extra="forbid")

    accounts: int = Field(ge=0)
    automation_count_total: int = Field(ge=0)
    messages_processed_total: int = Field(ge=0)
    notifications_sent_total: int = Field(ge=0)
    notifications_billed_total: int = Field(ge=0)
    total_records_total: int = Field(ge=0)


class UsageBySubscriptionStatusDTO(BaseModel):
    model_config = ConfigDict(extra="forbid")

    active: UsageTotalsDTO
    inactive: UsageTotalsDTO