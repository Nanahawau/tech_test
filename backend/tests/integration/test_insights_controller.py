import pytest


@pytest.mark.integration
@pytest.mark.analytics
class TestInsightsController:
    """Integration tests for insights/analytics endpoints"""

    def test_get_summary_leadership(self, client, auth_headers):
        """Test GET /api/insights/summary with leadership audience"""
        response = client.get(
            "/api/insights/summary?audience=leadership",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        print(response.json())
        assert "analytics" in data
        assert "accounts_total" in data["analytics"]
        assert "accounts_active" in data["analytics"]
        assert isinstance(data["analytics"], dict)

    def test_get_summary_account_manager(self, client, auth_headers):
        """Test GET /api/insights/summary with account_manager audience"""
        response = client.get(
            "/api/insights/summary?audience=account_manager",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        print(response.json())
        assert "action_lists" in data
        assert isinstance(data["action_lists"], dict)

    def test_get_summary_requires_authentication(self, client):
        """Test summary endpoint requires authentication"""
        response = client.get("/api/insights/summary")
        assert response.status_code == 401

    def test_get_accounts_default_pagination(self, client, auth_headers):
        """Test GET /api/insights/accounts with default pagination"""
        response = client.get("/api/insights/accounts", headers=auth_headers)
        assert response.status_code == 200

        data = response.json()["data"]
        assert "items" in data
        assert "page" in data
        assert "page_size" in data
        assert "total_items" in data
        assert "total_pages" in data
        assert isinstance(data["items"], list)

    def test_get_accounts_custom_pagination(self, client, auth_headers):
        """Test accounts pagination with custom page and page_size"""
        response = client.get(
            "/api/insights/accounts?page=2&page_size=5",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        assert data["page"] == 2
        assert data["page_size"] == 5
        assert len(data["items"]) <= 5

    def test_get_accounts_filter_by_status(self, client, auth_headers):
        """Test filtering accounts by subscription status"""
        response = client.get(
            "/api/insights/accounts?status=active",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        for account in data["items"]:
            assert account["subscription"]["status"] == "active"

    def test_get_accounts_search_by_label(self, client, auth_headers):
        """Test searching accounts by account_label"""
        response = client.get(
            "/api/insights/accounts?search=acme",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        for account in data["items"]:
            assert "acme" in account["account_label"].lower()

    def test_get_accounts_filter_by_workflow(self, client, auth_headers):
        """Test filtering accounts by workflow title"""
        response = client.get(
            "/api/insights/accounts?workflow_title=Lead Sync",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        for account in data["items"]:
            assert "Lead Sync" in account["workflows"]["titles"]

    def test_get_accounts_sort_ascending(self, client, auth_headers):
        """Test sorting accounts by account_label ascending"""
        response = client.get(
            "/api/insights/accounts?sort_by=account_label&sort_dir=asc",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        labels = [acc["account_label"] for acc in data["items"]]
        assert labels == sorted(labels)

    def test_get_accounts_sort_descending(self, client, auth_headers):
        """Test sorting accounts descending"""
        response = client.get(
            "/api/insights/accounts?sort_by=account_label&sort_dir=desc",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        labels = [acc["account_label"] for acc in data["items"]]
        assert labels == sorted(labels, reverse=True)

    def test_get_accounts_filter_by_uuid(self, client, auth_headers):
        """Test filtering by account_uuid"""
        all_accounts = client.get("/api/insights/accounts", headers=auth_headers).json()["data"]
        target_uuid = all_accounts["items"][0]["account_uuid"]

        response = client.get(
            f"/api/insights/accounts?account_uuid={target_uuid}",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        assert len(data["items"]) == 1
        assert data["items"][0]["account_uuid"] == target_uuid

    def test_get_accounts_combined_filters(self, client, auth_headers):
        """Test multiple filters combined"""
        response = client.get(
            "/api/insights/accounts?status=active&page=1&page_size=10&sort_by=account_label",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        assert data["page"] == 1
        assert data["page_size"] == 10
        for account in data["items"]:
            assert account["subscription"]["status"] == "active"

    def test_get_subscriptions_by_status(self, client, auth_headers):
        """Test GET /api/insights/analytics/subscriptions-by-status"""
        response = client.get(
            "/api/insights/analytics/subscriptions-by-status",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        assert "labels" in data
        assert "values" in data
        assert len(data["labels"]) == len(data["values"])
        assert "active" in data["labels"]
        assert "inactive" in data["labels"]

    def test_get_notifications_sent_vs_billed(self, client, auth_headers):
        """Test GET /api/insights/analytics/notifications-sent-vs-billed"""
        response = client.get(
            "/api/insights/analytics/notifications-sent-vs-billed",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        assert "labels" in data
        assert "values" in data
        assert "sent" in data["labels"]
        assert "billed" in data["labels"]

    def test_get_top_workflows_default_limit(self, client, auth_headers):
        """Test GET /api/insights/analytics/workflows/top with default limit"""
        response = client.get(
            "/api/insights/analytics/workflows/top",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        assert "labels" in data
        assert "values" in data
        assert len(data["labels"]) <= 10  # Default limit

    def test_get_top_workflows_custom_limit(self, client, auth_headers):
        """Test top workflows with custom limit"""
        response = client.get(
            "/api/insights/analytics/workflows/top?limit=5",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        assert len(data["labels"]) <= 5
        assert len(data["values"]) <= 5

    def test_get_usage_by_subscription_status(self, client, auth_headers):
        """Test GET /api/insights/analytics/usage/by-subscription-status"""
        response = client.get(
            "/api/insights/analytics/usage/by-subscription-status",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()["data"]
        assert "active" in data
        assert "inactive" in data

        # Check active data structure
        assert "accounts" in data["active"]
        assert "total_records_total" in data["active"]
        assert "automation_count_total" in data["active"]
        assert "messages_processed_total" in data["active"]
        assert "notifications_sent_total" in data["active"]
        assert "notifications_billed_total" in data["active"]

        # Check inactive data structure
        assert "accounts" in data["inactive"]
        assert "total_records_total" in data["inactive"]

    def test_analytics_endpoints_require_authentication(self, client):
        """Test all analytics endpoints require authentication"""
        endpoints = [
            "/api/insights/analytics/subscriptions-by-status",
            "/api/insights/analytics/notifications-sent-vs-billed",
            "/api/insights/analytics/workflows/top",
            "/api/insights/analytics/usage/by-subscription-status",
        ]

        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code == 401, f"Endpoint {endpoint} should require auth"