import requests
import sys

API_URL = "http://127.0.0.1:8000"

def create_admin():
    payload = {
        "name": "admin",
        "email": "admin@admin.com",
        "password": "admin@123",
        "confirm_password": "admin@123",
        "preferred_project_role": "VIEWER" # This is ignored for admin anyway
    }
    
    try:
        print(f"Attempting to register admin: {payload['email']}")
        response = requests.post(f"{API_URL}/auth/register", json=payload)
        
        if response.status_code == 200:
            print("SUCCESS! Admin created successfully.")
            print(f"Token: {response.json().get('access_token')}")
        elif response.status_code == 400 and "already registered" in response.text:
            print("User already exists. Please log in.")
        else:
            print(f"FAILED. Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_admin()
