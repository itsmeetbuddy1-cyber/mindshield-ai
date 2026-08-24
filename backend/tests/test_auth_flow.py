import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine
from app.models import models

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield

def test_signup_and_login_flow():
    test_email = "test_user_flow@example.com"
    test_password = "SecurePassword123!"
    
    signup_res = client.post("/api/auth/signup", json={
        "name": "Test User",
        "email": test_email,
        "password": test_password
    })
    
    if signup_res.status_code == 200:
        data = signup_res.json()
        assert "token" in data
        assert data["user"]["email"] == test_email
        assert data["user"]["display_name"] == "Test User"
    else:
        assert signup_res.status_code == 400
        assert "Email already registered" in signup_res.json()["detail"]

    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "token" in login_data
    token = login_data["token"]

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email

def test_login_invalid_credentials():
    res = client.post("/api/auth/login", json={
        "email": "nonexistent_random_user_12345@example.com",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]

def test_google_auth_flow():
    google_email = "google_test_user@gmail.com"
    res = client.post("/api/auth/google", json={
        "email": google_email,
        "name": "Google Tester"
    })
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == google_email
    assert data["user"]["display_name"] == "Google Tester"

def test_forgot_and_reset_password_flow():
    user_email = "reset_test_user@example.com"
    
    client.post("/api/auth/signup", json={
        "name": "Reset Tester",
        "email": user_email,
        "password": "InitialPassword123"
    })

    forgot_res = client.post("/api/auth/forgot-password", json={"email": user_email})
    assert forgot_res.status_code == 200
    forgot_data = forgot_res.json()
    assert "reset_code" in forgot_data

    reset_res = client.post("/api/auth/reset-password", json={
        "email": user_email,
        "token": forgot_data["reset_code"] or "reset_123456",
        "new_password": "NewUpdatedPassword123!"
    })
    assert reset_res.status_code == 200

    login_res = client.post("/api/auth/login", json={
        "email": user_email,
        "password": "NewUpdatedPassword123!"
    })
    assert login_res.status_code == 200
