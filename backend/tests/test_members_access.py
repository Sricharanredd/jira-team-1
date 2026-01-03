import sys
import os
import requests
from sqlalchemy import create_engine, text
from app.modules.auth.security import get_password_hash

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import DATABASE_URL

BASE_URL = "http://127.0.0.1:8000"
ADMIN_EMAIL = "admin_mem@example.com"
SM_EMAIL = "sm_mem@example.com"
DEV_EMAIL = "dev_mem@example.com"
PASSWORD = "password123"

def setup_data():
    engine = create_engine(DATABASE_URL)
    pwd_hash = get_password_hash(PASSWORD)
    
    with engine.connect() as conn:
        # Cleanup
        emails = [ADMIN_EMAIL, SM_EMAIL, DEV_EMAIL]
        email_list = "', '".join(emails)
        conn.execute(text(f"DELETE FROM project_members WHERE user_id IN (SELECT id FROM users WHERE email IN ('{email_list}'))"))
        conn.execute(text(f"DELETE FROM users WHERE email IN ('{email_list}')"))
        conn.execute(text("DELETE FROM project WHERE project_name = 'MemberTest'"))
        
        # Insert Users
        for email in emails:
            conn.execute(text(f"INSERT INTO users (name, email, password_hash, is_active, global_role) VALUES ('{email.split('@')[0]}', '{email}', '{pwd_hash}', 1, 'USER')"))
        conn.commit()
    
    print("Users setup completed.")

def get_token(email):
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": PASSWORD})
    return res.json().get("access_token")

def run_test():
    setup_data()
    
    # 1. Login as Admin
    admin_token = get_token(ADMIN_EMAIL)
    sm_token = get_token(SM_EMAIL)
    dev_token = get_token(DEV_EMAIL)
    
    if not admin_token:
        print("Failed to login Admin")
        return

    # 2. Create Project (as Admin) -> Should auto-assign Role
    print("\n[TEST] Create Project as Admin (auto-assign verify)")
    headers = {"Authorization": f"Bearer {admin_token}"}
    data = {"project_name": "MemberTest", "project_prefix": "MT"}
    
    # Needs Global Admin to create project?
    # Update user to global admin for this test
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        conn.execute(text(f"UPDATE users SET global_role='ADMIN' WHERE email='{ADMIN_EMAIL}'"))
        conn.commit()

    res = requests.post(f"{BASE_URL}/project", headers=headers, data=data) 
    if res.status_code != 200:
        print(f"Failed to create project: {res.text}")
        return
        
    project_id = res.json()["id"]
    print(f"Project Created ID: {project_id}")
    
    # 3. Add Members (Admin Action)
    print("\n[TEST] Add Members (Admin Action)")
    # Add SM
    data = {"email": SM_EMAIL, "role": "SCRUM_MASTER"}
    res = requests.post(f"{BASE_URL}/projects/{project_id}/members", headers=headers, data=data)
    print(f"Add SM: {res.status_code}") # Expect 200
    
    # Add Dev
    data = {"email": DEV_EMAIL, "role": "DEVELOPER"}
    res = requests.post(f"{BASE_URL}/projects/{project_id}/members", headers=headers, data=data)
    print(f"Add Dev: {res.status_code}") # Expect 200
    
    # 4. Verify GET Members Access
    print("\n[TEST] GET Members Access")
    
    # Admin -> 200
    res = requests.get(f"{BASE_URL}/projects/{project_id}/members", headers={"Authorization": f"Bearer {admin_token}"})
    print(f"Admin GET: {res.status_code} (Expect 200)")
    if res.status_code == 200:
        print(f"Members: {len(res.json())}")

    # SM -> 200
    res = requests.get(f"{BASE_URL}/projects/{project_id}/members", headers={"Authorization": f"Bearer {sm_token}"})
    print(f"SM GET: {res.status_code} (Expect 200)")

    # Dev -> 403
    res = requests.get(f"{BASE_URL}/projects/{project_id}/members", headers={"Authorization": f"Bearer {dev_token}"})
    print(f"Dev GET: {res.status_code} (Expect 403)")
    if res.status_code == 403:
        print(f"Detail: {res.json()['detail']}")

if __name__ == "__main__":
    run_test()
