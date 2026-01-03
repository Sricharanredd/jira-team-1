
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
        return None
    except:
        return None

def create_epic(token):
    headers = {"Authorization": f"Bearer {token}"}
    title = f"Test Epic {''.join(random.choices(string.ascii_uppercase, k=5))}"
    
    data = {
        "release_number": "R1.0",
        "assignee": "admin",
        "reviewer": "admin",
        "title": title,
        "description": "Auto Epic",
        "status": "todo",
        "issue_type": "epic", # EPIC TYPE
        "parent_issue_id": ""
    }
    
    print(f"Creating EPIC: {title}...")
    resp = requests.post(f"{BASE_URL}/projects/1/issues", headers=headers, data=data)
    
    if resp.status_code == 200:
        print("SUCCESS! Epic created.")
        print(resp.json())
    else:
        print(f"FAILURE: {resp.status_code}")
        print(resp.text)

if __name__ == "__main__":
    token = get_token()
    if token:
        create_epic(token)
