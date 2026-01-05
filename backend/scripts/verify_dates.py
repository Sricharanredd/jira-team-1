
import requests
import json
import time
from datetime import datetime

# Adjust URL to match your local backend
BASE_URL = "http://127.0.0.1:8000"

def create_story_with_dates():
    # 1. Login to get token (assuming admin credentials from previous context)
    # email: admin@admin.com, password: admin
    # OR ramyasri15007@gmail.com / ramya131518 based on context history
    # Let's try the ramyasri credentials as they were mentioned
    
    auth_data = {
        "username": "ramyasri15007@gmail.com",
        "password": "ramya131518"
    }
    
    # Try login
    try:
        login_res = requests.post(f"{BASE_URL}/auth/login", data=auth_data)
        if login_res.status_code != 200:
             # Fallback to default admin if that fails
             auth_data = {"username": "admin@admin.com", "password": "admin"}
             login_res = requests.post(f"{BASE_URL}/auth/login", data=auth_data)
        
        login_res.raise_for_status()
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Logged in via API")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    # 2. Create Issue with Dates
    # We need a valid Project ID. Lets guess 1 or fetch.
    try:
        project_res = requests.get(f"{BASE_URL}/projects/1", headers=headers)
        if project_res.status_code != 200:
            print("Project 1 not found, trying Project 2")
            project_id = 999 # Fail
            # List projects
            projects = requests.get(f"{BASE_URL}/project", headers=headers).json()
            if projects:
                 project_id = projects[0]['id']
            else:
                 print("No projects found")
                 return
        else:
            project_id = 1
            
        print(f"Using Project ID: {project_id}")



        data = {
            "title": f"Test Date Feature {int(time.time())}",
            "description": "Verifying start and end dates",
            "release_number": "1.0",
            "sprint_number": "1",
            "assignee": "Unassigned", # or valid user
            "reviewer": "Self",
            "status": "todo",
            "issue_type": "epic",
            "start_date": "2025-01-01",
            "end_date": "2025-01-31",
            "project_id": str(project_id)
        }
        
        # Note: Backend expects Form Data
        res = requests.post(f"{BASE_URL}/projects/{project_id}/issues", data=data, headers=headers)
        
        print(f"Create Response: {res.status_code}")
        if res.status_code == 200:
            story = res.json()
            print(f"Story Created: ID={story['id']}")
            print(f"Start Date: {story.get('start_date')}")
            print(f"End Date: {story.get('end_date')}")
            
            if story.get('start_date') and story.get('end_date'):
                print("SUCCESS: Dates verified!")
            else:
                print("FAILURE: Dates missing in response")
        else:
            print(f"Failed to create story: {res.text}")

    except Exception as e:
        print(f"Error during creation: {e}")

if __name__ == "__main__":
    create_story_with_dates()
