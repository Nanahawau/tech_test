import pytest


@pytest.mark.integration
@pytest.mark.ingestion
class TestIngestionController:
    """Integration tests for data ingestion endpoints"""

    def test_upload_csv_success(self, client, auth_headers, valid_csv_file_factory):
        """Test POST /api/ingest/ with valid CSV file"""
        files = {"file": ("test.csv", valid_csv_file_factory(), "text/csv")}

        response = client.post("/api/ingest/", headers=auth_headers, files=files)
        assert response.status_code == 200

        data = response.json()["data"]
        status = response.json()["status"]
        assert status is True
        assert "ok" in data
        assert "records_loaded" in data

    def test_upload_csv_requires_authentication(self, client, valid_csv_file_factory):
        """Test upload requires authentication"""
        files = {"file": ("test.csv", valid_csv_file_factory(), "text/csv")}
        response = client.post("/api/ingest/", files=files)
        assert response.status_code == 401

    def test_upload_csv_invalid_headers(self, client, auth_headers):
        """Test upload fails with wrong CSV headers"""
        invalid_csv = b"name,email,age\nJohn,john@example.com,30"
        files = {"file": ("invalid.csv", invalid_csv, "text/csv")}

        response = client.post("/api/ingest/", headers=auth_headers, files=files)
        assert response.status_code == 422

        error_details = response.json()["error"]["details"]
        data = response.json()["data"]

        assert "missing" in error_details
        assert data is None

    def test_upload_csv_empty_file(self, client, auth_headers, empty_csv):
        """Test upload fails with empty file"""
        files = {"file": ("empty.csv", empty_csv, "text/csv")}

        response = client.post("/api/ingest/", headers=auth_headers, files=files)
        assert response.status_code == 422
        assert "empty" in response.json()["error"]["message"].lower()

    def test_upload_csv_wrong_file_type(self, client, auth_headers):
        """Test upload rejects non-CSV files"""
        files = {"file": ("test.txt", b"not a csv", "text/plain")}

        response = client.post("/api/ingest/", headers=auth_headers, files=files)
        print(response.json())
        assert response.status_code == 422
        assert ".csv" in response.json()["error"]["message"].lower()

    def test_upload_csv_no_file(self, client, auth_headers):
        """Test upload fails without file"""
        response = client.post("/api/ingest/", headers=auth_headers)
        assert response.status_code == 422

    def test_reload_data_requires_authentication(self, client):
        """Test reload requires authentication"""
        response = client.post("/api/ingest/reload")
        assert response.status_code == 401