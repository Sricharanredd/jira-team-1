import requests  # type: ignore
import time

URL_AUTH = "http://localhost:8000/auth/login"
URL_CREATE = "http://localhost:8000/projects/1/issues" # Assuming Project 1 exists

USER = "debug_user@example.com"
PASS = "debugpassword123"

def verify():
    # 1. Login
    print(f"Logging in as {USER}...")
    try:
        res = requests.post(URL_AUTH, data={"username": USER, "password": PASS})
        if res.status_code != 200:
            print(f"Login Failed: {res.status_code} {res.text}")
            return
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login Success.")
    except Exception as e:
        print(f"Connection Error: {e}")
        return

    # 2. Create Story A
    title = f"Test Duplicate {int(time.time())}"
    data = {
        "project_id": 1,
        "release_number": "R1",
        "sprint_number": "S1",
        "assignee": "Riya",
        "reviewer": "Ram",
        "title": title,
        "description": "Desc 1",
        "status": "backlog",
        "issue_type": "story"
    }
    
    print(f"Creating Story A: '{title}'...")
    res1 = requests.post(URL_CREATE, data=data, headers=headers)
    if res1.status_code == 200:
        print("Story A Created.")
    else:
        print(f"Story A Failed: {res1.status_code} {res1.text}")
        return

    # 3. Create Story B (Same Title)
    print(f"Creating Story B: '{title}' (Duplicate)...")
    res2 = requests.post(URL_CREATE, data=data, headers=headers)
    if res2.status_code == 200:
        print("Story B Created. DUPLICATES ALLOWED. Fix works!")
    elif res2.status_code == 400 or res2.status_code == 409:
        print(f"Story B Failed (Expected if bad): {res2.status_code} {res2.text}")
        print("DUPLICATES BLOCKED.")
    else:
        print(f"Story B Failed with unexpected error: {res2.status_code} {res2.text}")

if __name__ == "__main__":
    verify()
