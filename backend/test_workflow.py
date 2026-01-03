
import requests

BASE_URL = "http://127.0.0.1:8000"

def test_transition():
    # Login
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@admin.com", "password": "admin@123"})
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Issue (Backlog)
    data = {
        "title": "Transition Test Epic",
        "description": "Test",
        "assignee": "admin",
        "reviewer": "admin",
        "release_number": "R1",
        "sprint_number": "", # Fixed in crud but let's be explicit
        "status": "backlog", 
        "issue_type": "epic", # Use Epic to avoid parent
        "parent_issue_id": ""
    }
    create_resp = requests.post(f"{BASE_URL}/projects/1/issues", headers=headers, data=data) 
    # Note: Using /projects/1/issues directly might fail if it uses Form() and I send JSON? 
    # The previous tests used requests.post(..., data=data) which sends Form-Encoded. That works.
    
    if create_resp.status_code == 200:
        story_id = create_resp.json()["id"]
        print(f"Created Story ID: {story_id} with Status: BACKLOG")
        
        # Update Status to IN_PROGRESS
        update_data = new_data = new_form_data = {"status": "in_progress"} 
        # API expects Form data? Let's check router. UserStory router PUT expects JSON or Form?
        # Usually PUT uses Pydantic body.
        # Let's try JSON first.
        
        update_resp = requests.put(f"{BASE_URL}/user-story/{story_id}", headers=headers, json=update_data)
        if update_resp.status_code == 200:
            print("SUCCESS: Transition form BACKLOG to IN_PROGRESS allowed.")
        else:
            # Try form data if JSON failed 422
            update_resp_form = requests.put(f"{BASE_URL}/user-story/{story_id}", headers=headers, data=update_data)
            if update_resp_form.status_code == 200:
                print("SUCCESS: Transition allowed via Form Data.")
            else:
                print(f"FAILURE: {update_resp.status_code} {update_resp.text}")
    else:
        print(f"Failed to create story: {create_resp.status_code} {create_resp.text}")

if __name__ == "__main__":
    test_transition()
