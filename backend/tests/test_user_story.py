from fastapi.testclient import TestClient
from app.main import app
import pytest
import uuid

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200


def test_get_all_user_stories():
    response = client.get("/user-story/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.fixture(scope="module")
def created_story_pointer():
    story_pointer = f"TEST-{uuid.uuid4()}"

    data = {
        "project_name": "Test Project",
        "release_number": "R1.0",
        "sprint_number": "Sprint-1",
        "story_pointer": story_pointer,
        "assignee": "Tester",
        "reviewer": "Reviewer",
        "title": "Test Story",
        "description": "This is a test user story",
        "status": "Open",
    }

    response = client.post("/user-story/", data=data)
    assert response.status_code == 200

    return story_pointer


def test_get_user_story_by_pointer(created_story_pointer):
    response = client.get(f"/user-story/{created_story_pointer}")
    assert response.status_code == 200


def test_update_user_story(created_story_pointer):
    updated_data = {
        "project_name": "Test Project",
        "release_number": "R1.0",
        "sprint_number": "Sprint-1",
        "assignee": "Tester",
        "reviewer": "Reviewer",
        "title": "Updated Test Story",
        "description": "Updated description",
        "status": "In Progress",
    }

    response = client.put(f"/user-story/{created_story_pointer}", data=updated_data)

    assert response.status_code == 200


def test_delete_user_story(created_story_pointer):
    response = client.delete(f"/user-story/{created_story_pointer}")
    assert response.status_code == 200


def test_delete_non_existing_story():
    response = client.delete("/user-story/INVALID-999")
    assert response.status_code == 404
