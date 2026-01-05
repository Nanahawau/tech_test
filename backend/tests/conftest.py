import os
import sys
from io import BytesIO
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]  # .../backend
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app


def _json_or_text(resp):
    try:
        return resp.json()
    except Exception:
        return resp.text


# ----------------------------
# Core client / auth fixtures
# ----------------------------
@pytest.fixture(scope="session")
def client():
    """Create a single FastAPI test client (runs lifespan events)."""
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture(scope="session")
def test_credentials():
    """
    Credentials used for integration auth.

    Override via env vars to match your backend:
      TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD
    """
    return {
        "email": os.getenv("TEST_ADMIN_EMAIL", "test@gmail.com"),
        "password": os.getenv("TEST_ADMIN_PASSWORD", "test"),
    }


@pytest.fixture
def auth_token(client, test_credentials):
    """
    Get a valid authentication token.

    Tries both common FastAPI patterns:
      1) OAuth2PasswordRequestForm: data={username,password}
      2) JSON body: json={email,password}

    If neither works (often because the admin user isn't seeded), skip auth-required tests
    instead of error-cascading.
    """
    email = test_credentials["email"]
    password = test_credentials["password"]

    # 1) OAuth2 form (username/password)
    resp_form = client.post(
        "/api/auth/token",
        data={"username": email, "password": password},
    )
    if resp_form.status_code == 200:
        body = _json_or_text(resp_form)
        data = body.get("data", body) if isinstance(body, dict) else {}
        token = data.get("access_token") if isinstance(data, dict) else None
        assert token, f"200 from /api/auth/token but no access_token. Body: {body}"
        return token

    # 2) JSON (email/password)
    resp_json = client.post(
        "/api/auth/token",
        json={"email": email, "password": password},
    )
    if resp_json.status_code == 200:
        body = _json_or_text(resp_json)
        data = body.get("data", body) if isinstance(body, dict) else {}
        token = data.get("access_token") if isinstance(data, dict) else None
        assert token, f"200 from /api/auth/token but no access_token. Body: {body}"
        return token

    pytest.skip(
        "Could not obtain auth token.\n"
        f"Form status={resp_form.status_code} body={_json_or_text(resp_form)}\n"
        f"JSON status={resp_json.status_code} body={_json_or_text(resp_json)}\n"
        "Set TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD to valid credentials (or seed the test user)."
    )


@pytest.fixture
def auth_headers(auth_token):
    """Get authentication headers with Bearer token"""
    return {"Authorization": f"Bearer {auth_token}"}


# ----------------------------
# Mock auth payloads (tests)
# ----------------------------
@pytest.fixture
def mock_user_credentials(test_credentials):
    """Mock valid user credentials (matches env-configured credentials)."""
    return {"email": test_credentials["email"], "password": test_credentials["password"]}


@pytest.fixture
def mock_invalid_credentials(test_credentials):
    """Mock invalid user credentials"""
    return {"email": test_credentials["email"], "password": "wrongpassword"}


# ----------------------------
# CSV fixtures
# ----------------------------
@pytest.fixture
def valid_csv_content():
    """Valid CSV file content"""
    return b"account_uuid,account_label,status\n123-abc,Acme Corp,active\n456-def,Tech Co,inactive"


@pytest.fixture
def valid_csv_file_factory(valid_csv_content):
    """Factory that returns a fresh BytesIO each time (prevents EOF reuse issues)."""
    def _make():
        return BytesIO(valid_csv_content)

    return _make


@pytest.fixture
def valid_csv_file(valid_csv_file_factory):
    """Backward-compatible: a single fresh BytesIO per test."""
    return valid_csv_file_factory()


@pytest.fixture
def invalid_csv_headers():
    """CSV with wrong headers"""
    return b"name,email,age\nJohn,john@example.com,30"


@pytest.fixture
def empty_csv():
    """Empty CSV file"""
    return b""


# ----------------------------
# Mock Account Data
# ----------------------------
@pytest.fixture
def mock_account_record():
    """Mock account record"""
    return {
        "account_uuid": "123e4567-e89b-12d3-a456-426614174000",
        "account_label": "Acme Corporation",
        "subscription": {
            "status": "active",
            "admin_seats": 2,
            "user_seats": 10,
            "read_only_seats": 5,
        },
        "usage": {
            "total_records": 50000,
            "automation_count": 25,
            "messages_processed": 15000,
            "notifications_sent": 3000,
            "notifications_billed": 2800,
        },
        "workflows": {
            "count": 5,
            "titles": ["Lead Sync", "Customer Onboarding", "Q3 Campaign"],
        },
    }


@pytest.fixture
def mock_accounts_list(mock_account_record):
    """Mock list of accounts"""
    return [
        mock_account_record,
        {
            **mock_account_record,
            "account_uuid": "223e4567-e89b-12d3-a456-426614174000",
            "account_label": "Tech Innovators",
        },
        {
            **mock_account_record,
            "account_uuid": "323e4567-e89b-12d3-a456-426614174000",
            "account_label": "Global Solutions",
        },
    ]


# ----------------------------
# Mock Analytics Data
# ----------------------------
@pytest.fixture
def mock_chart_data():
    """Mock chart data response"""
    return {"labels": ["active", "inactive"], "values": [7, 3]}


@pytest.fixture
def mock_usage_by_status():
    """Mock usage by subscription status"""
    return {
        "active": {
            "accounts": 7,
            "total_records_total": 350000,
            "automation_count_total": 175,
            "messages_processed_total": 105000,
            "notifications_sent_total": 21000,
            "notifications_billed_total": 19600,
        },
        "inactive": {
            "accounts": 3,
            "total_records_total": 150000,
            "automation_count_total": 75,
            "messages_processed_total": 45000,
            "notifications_sent_total": 9000,
            "notifications_billed_total": 8400,
        },
    }

@pytest.fixture
def valid_csv_file_factory():
    """Factory to create valid CSV files with correct headers"""
    def _create_csv():
        csv_content = (
            "Account UUID,Account Label,Subscription Status,Admin Seats,User Seats,"
            "Read Only Seats,Total Records,Automation Count,Workflow Title,"
            "Messages Processed,Notifications Sent,Notifications Billed\n"
            "uuid-123,Test Account,active,2,5,3,1000,10,Test Workflow,5000,4500,4000\n"
            "uuid-456,Demo Account,trial,1,2,1,500,5,Demo Workflow,2000,1800,1500\n"
        )
        return csv_content.encode('utf-8')
    return _create_csv