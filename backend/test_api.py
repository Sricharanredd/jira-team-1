
import requests
import random
import string

BASE_URL = "http://127.0.0.1:8000"

def get_token():
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", data={
            "username": "admin@admin.com",
            "password": "admin@123"
        })
        if resp.status_code == 200:
            return resp.json()["access_token"]
        else:
            print(f"Login Failed: {resp.status_code} {resp.text}")
            return None
    except Exception as e:
        print(f"Connection Error: {e}")
        return None

def create_story(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    unique_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    title = f"Test Story {unique_suffix}"
    
    data = {
        "release_number": "R1.0",
        # sprint_number is optional now, let's leave it empty to test that too
        "assignee": "admin", # Assuming 'admin' is a valid user name or we need ID? Schema says string example="Sanji". 
        # Wait, models say assignee is String(100). Valid.
        "reviewer": "admin",
        "title": title,
        "description": "Automated test description",
        "status": "todo",
        "issue_type": "story",
        "parent_issue_id": ""
    }
    
    # Needs to be sent as FormData because the endpoint uses Form(...)
    # requests.post(..., data=data) sends form-encoded.
    
    print(f"Attempting to create story: '{title}' in Project 1")
    resp = requests.post(f"{BASE_URL}/projects/1/issues", headers=headers, data=data)
    
    if resp.status_code == 200:
        print("SUCCESS! Story created.")
        print(resp.json())
    else:
        print(f"FAILURE: {resp.status_code}")
        print(resp.text)

if __name__ == "__main__":
    token = get_token()
    if token:
        create_story(token)
