import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.modules.auth.models import RoleType, GlobalRole

# Setup Test DB (SQLite in-memory)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create Tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def teardown_module(module):
    Base.metadata.drop_all(bind=engine)

# ---------------- TESTS ----------------

def test_strict_rbac_registration():
    # 1. Register Bootstrap Admin
    response = client.post("/auth/register", json={
        "name": "Super Admin",
        "email": "sricharanreddyk33@gmail.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "preferred_project_role": "VIEWER" 
        # preferred_role should be ignored for global role assignment
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Verify Admin Role
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    user_data = response.json()
    assert user_data["global_role"] == "ADMIN"

    # 2. Register Regular User (Even if they try to be clever)
    response = client.post("/auth/register", json={
        "name": "Hacker User",
        "email": "hacker@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "global_role": "ADMIN", # Should be ignored
        "preferred_project_role": "DEVELOPER"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Verify USER Role
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    user_data = response.json()
    assert user_data["global_role"] == "USER"
    assert user_data["preferred_role"] == "DEVELOPER"

def get_token(email, password="Password123!"):
    response = client.post("/auth/login", data={"username": email, "password": password})
    return response.json()["access_token"]

def test_project_creation_restriction():
    admin_token = get_token("sricharanreddyk33@gmail.com")
    user_token = get_token("hacker@example.com")

    # 1. Regular User Tries to Create Project -> 403
    user_headers = {"Authorization": f"Bearer {user_token}"}
    response = client.post("/project", data={"project_name": "Hacker Project", "project_prefix": "HK"}, headers=user_headers)
    assert response.status_code == 403
    assert "Only Global Admins" in response.json()["detail"]

    # 2. Admin Tries to Create Project -> 200
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post("/project", data={"project_name": "Official Project", "project_prefix": "OP"}, headers=admin_headers)
    assert response.status_code == 200
    project_id = response.json()["id"]

    # 3. Regular User Tries to SEE Project (Not a member yet)
    response = client.get("/project", headers=user_headers)
    projects = response.json()
    # Should be empty or not contain this project
    assert not any(p["id"] == project_id for p in projects)

def test_project_settings_strictness():
    admin_token = get_token("sricharanreddyk33@gmail.com")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Get the project created above
    response = client.get("/project", headers=admin_headers)
    project_id = response.json()[0]["id"]

    # Add Hacker as MEMBER
    response = client.post(f"/projects/{project_id}/members", data={"email": "hacker@example.com", "role": "DEVELOPER"}, headers=admin_headers)
    assert response.status_code == 200

    # Hacker tries to add member -> 403
    user_token = get_token("hacker@example.com")
    user_headers = {"Authorization": f"Bearer {user_token}"}
    response = client.post(f"/projects/{project_id}/members", data={"email": "newbie@example.com", "role": "VIEWER"}, headers=user_headers)
    assert response.status_code == 403
