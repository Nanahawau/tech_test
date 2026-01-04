from typing import Optional

from fastapi import APIRouter, Query, Depends

from models.api_responses import (
    AccountsPageDTO,
    ApiSuccessResponse,
    ChartDTO,
    SummaryData,
    UsageBySubscriptionStatusDTO,
)
from services.insights.analytics import (
    notifications_sent_vs_billed,
    subscriptions_by_status,
    top_workflows,
    usage_by_subscription_status,
)
from services.insights.accounts_query import SortBy, SortDir, get_records
from services.insights.summary import Audience, get_summary
from services.auth.dependencies import get_current_email

router = APIRouter(prefix="/api/insights", tags=["insights"], dependencies=[Depends(get_current_email)])


@router.get("/summary", response_model=ApiSuccessResponse[SummaryData])
def summary(audience: Audience = Query(Audience.leadership)):
    return {"status": True, "data": get_summary(audience=audience)}


@router.get("/accounts", response_model=ApiSuccessResponse[AccountsPageDTO])
def accounts_query(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    account_uuid: Optional[str] = Query(None, description="A uuid string"),
    status: Optional[str] = Query(None, description="active|inactive"),
    search: Optional[str] = Query(None, description="Case-insensitive substring match on account_label"),
    workflow_title: Optional[str] = Query(None, description="Exact match on workflow title (case-insensitive)"),
    sort_by: SortBy = Query(SortBy.account_label),
    sort_dir: SortDir = Query(SortDir.asc),
):
    return {"status": True, "data": get_records(
        page=page,
        page_size=page_size,
        account_uuid=account_uuid,
        status=status,
        search=search,
        workflow_title=workflow_title,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )}


@router.get("/analytics/subscriptions-by-status", response_model=ApiSuccessResponse[ChartDTO])
def analytics_subscriptions_by_status():
    return {"status": True, "data": subscriptions_by_status()}


@router.get("/analytics/notifications-sent-vs-billed", response_model=ApiSuccessResponse[ChartDTO])
def analytics_notifications_sent_vs_billed():
    return {"status": True, "data": notifications_sent_vs_billed()}


@router.get("/analytics/workflows/top", response_model=ApiSuccessResponse[ChartDTO])
def analytics_top_workflows(limit: int = Query(10, ge=1, le=100)):
    return {"status": True, "data": top_workflows(limit=limit)}


@router.get("/analytics/usage/by-subscription-status", response_model=ApiSuccessResponse[UsageBySubscriptionStatusDTO])
def analytics_usage_by_subscription_status():
    return {"status": True, "data": usage_by_subscription_status()}