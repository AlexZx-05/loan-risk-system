from fastapi.testclient import TestClient

from api.fastapi_server import app


client = TestClient(app)


def login(username: str, password: str):
    return client.post(
        "/login",
        data={"username": username, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )


def auth_headers(username: str, password: str):
    response = login(username, password)
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_home_and_health():
    home_response = client.get("/")
    assert home_response.status_code == 200
    assert "Loan Risk AI Backend Running Successfully" in home_response.json()["message"]

    health_response = client.get("/health")
    assert health_response.status_code == 200
    payload = health_response.json()
    assert payload["status"] == "ok"
    assert payload["model_loaded"] is True
    assert "timestamp" in payload


def test_login_success_and_failure():
    good = login("officer", "officer123")
    assert good.status_code == 200
    good_payload = good.json()
    assert good_payload["token_type"] == "bearer"
    assert good_payload["role"] == "OFFICER"
    assert "access_token" in good_payload

    bad = login("officer", "wrong-password")
    assert bad.status_code == 401
    assert bad.json()["detail"] == "Invalid credentials"


def test_protected_endpoint_requires_token():
    response = client.get("/analytics")
    assert response.status_code == 401


def test_analytics_access_for_officer_and_admin():
    officer_response = client.get("/analytics", headers=auth_headers("officer", "officer123"))
    assert officer_response.status_code == 200
    officer_payload = officer_response.json()
    assert "total_customers" in officer_payload
    assert "summary_counts" in officer_payload
    assert "average_confidence" in officer_payload

    admin_response = client.get("/analytics", headers=auth_headers("admin", "admin123"))
    assert admin_response.status_code == 200


def test_predict_validation_and_response_shape():
    invalid_payload = {
        "missed_emi_count": -1,
        "avg_delay_days": 12,
        "max_delay_days": 40,
        "emi_income_ratio": 0.5,
    }
    invalid_response = client.post("/predict", json=invalid_payload)
    assert invalid_response.status_code == 422

    valid_payload = {
        "missed_emi_count": 2,
        "avg_delay_days": 6,
        "max_delay_days": 15,
        "emi_income_ratio": 0.32,
    }
    valid_response = client.post("/predict", json=valid_payload)
    assert valid_response.status_code == 200
    valid_body = valid_response.json()
    assert valid_body["risk_level"] in {"HIGH", "MEDIUM", "LOW"}
    assert 0 <= valid_body["risk_score"] <= 1
    assert valid_body["recommended_action"] in {
        "ESCALATE_TO_OFFICER",
        "MONITOR",
        "CONTINUE_NORMAL",
    }
    assert "explanation" in valid_body


def test_top_risky_and_need_officer_with_officer_token():
    top_risky = client.get("/top_risky", headers=auth_headers("officer", "officer123"))
    assert top_risky.status_code == 200
    assert isinstance(top_risky.json(), list)

    queue = client.get("/need_officer", headers=auth_headers("officer", "officer123"))
    assert queue.status_code == 200
    queue_payload = queue.json()
    assert "total_cases" in queue_payload
    assert "cases" in queue_payload
    assert isinstance(queue_payload["cases"], list)


def test_risk_history_not_found_response():
    response = client.get("/risk_history/99999999", headers=auth_headers("officer", "officer123"))
    assert response.status_code == 200
    assert response.json()["message"] == "No history found for this borrower"
