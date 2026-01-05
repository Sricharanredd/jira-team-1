import requests

URL = "http://localhost:8000/projects/1/issues"
headers = {
    # Assuming no auth or using a known token if needed. 
    # For now, let's see if we get 401 or something else.
    # Ideally need token. 
}

# Payload mirroring what CreateStoryModal sends
data = {
    "project_id": 1,
    "release_number": "R1.0",
    "sprint_number": "Sprint-1",
    "assignee": "Riya",
    "reviewer": "Ram",
    "title": "Test Story Title",
    "description": "Test Description",
    "status": "backlog",
    "issue_type": "story",
    "parent_issue_id": None, # or 10
    # "start_date": "",
    # "end_date": ""
}
# We need to send as FORM DATA (multipart/form-data) because backend uses Form(...)
# requests.post(..., data=data) does form-urlencoded or multipart depending on files.
# If files is None, it defaults to form-urlencoded.
# Backend Form(...) handles form-urlencoded too usually.

# Simulating the exact scenario:
# parent_issue_id is usually an integer or missing. 

print("Sending request...")
try:
    # Need to login first to get token
    auth_res = requests.post("http://localhost:8000/auth/login", data={"username": "ramyasri15007@gmail.com", "password": "ramya131518"})
    if auth_res.status_code == 200:
        token = auth_res.json()["access_token"]
        headers["Authorization"] = f"Bearer {token}"
        print(f"Got token. Sending CREATE request.")
        
        res = requests.post(URL, data=data, headers=headers)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
    else:
        print("Login failed", auth_res.text)

except Exception as e:
    print(f"Error: {e}")
