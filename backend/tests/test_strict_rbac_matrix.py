import sys
import os
import requests
from sqlalchemy import create_engine, text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import DATABASE_URL

# Configuration
BASE_URL = "http://127.0.0.1:8000"
ADMIN_EMAIL = "admin_test@example.com"
SM_EMAIL = "sm_test@example.com"
DEV_EMAIL = "dev_test@example.com"
TESTER_EMAIL = "tester_test@example.com"
VIEWER_EMAIL = "viewer_test@example.com"
PASSWORD = "password123"

def setup_users():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        # Create users if not exist
        emails = [ADMIN_EMAIL, SM_EMAIL, DEV_EMAIL, TESTER_EMAIL, VIEWER_EMAIL]
        for email in emails:
            conn.execute(text(f"INSERT IGNORE INTO users (name, email, password_hash, is_active, global_role) VALUES ('{email.split('@')[0]}', '{email}', 'hash', 1, 'USER')"))
        conn.commit()
    print("Test users setup complete.")

def register_user(email, name):
    # This is handled by setup_users for existing DB or simple register logic
    # But we need tokens. So let's login.
    pass

def get_token(email):
    response = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": PASSWORD})
    if response.status_code == 200:
        return response.json()["access_token"]
    # If failed, maybe need to register proper password hash via API or something.
    # We can fallback to simple script logic if we assume known state.
    # For now, let's assume users exist with password "password123"
    # Wait, existing passwords are hashed. I can't inject 'hash'.
    # I should use the API to register or use a known hash for 'password123'.
    # Existing known hash: $2b$12$q3mhsDSTFu0UmHo.vAyLkOgy3116nf1... (from log)
    # Let's use a known hash for 'password123' if we insert manually.
    return None

from app.modules.auth.security import get_password_hash

KNOWN_PASSWORD = "password123"

def setup_test_data():
     engine = create_engine(DATABASE_URL)
     known_hash = get_password_hash(KNOWN_PASSWORD)
     print(f"Generated hash for {KNOWN_PASSWORD}: {known_hash[:10]}...")
     
     with engine.connect() as conn:
         # 1. Clean up test users
         emails = [ADMIN_EMAIL, SM_EMAIL, DEV_EMAIL, TESTER_EMAIL, VIEWER_EMAIL]
         email_list = "', '".join(emails)
         conn.execute(text(f"DELETE FROM project_members WHERE user_id IN (SELECT id FROM users WHERE email IN ('{email_list}'))"))
         conn.execute(text(f"DELETE FROM users WHERE email IN ('{email_list}')"))
         
         # 2. Insert Users with known hash
         for email in emails:
             role = "USER"
             conn.execute(text(f"INSERT INTO users (name, email, password_hash, is_active, global_role) VALUES ('{email.split('@')[0]}', '{email}', '{known_hash}', 1, '{role}')"))
         
         conn.commit()
         print("Users created.")
         
         # 3. Find Valid Project ID
         # If no project exists, we should probably fail or assume one.
         # Ideally we insert one to be safe.
         res = conn.execute(text("SELECT id FROM project LIMIT 1"))
         existing_project_id = res.scalar()
         
         if not existing_project_id:
             print("No projects found! Inserting test project.")
             # Insert dummy project
             conn.execute(text("INSERT INTO project (project_name, project_prefix, description, created_by) VALUES ('Test Project', 'TP', 'Desc', 1)"))
             conn.commit()
             res = conn.execute(text("SELECT id FROM project WHERE project_prefix = 'TP'"))
             project_id = res.scalar()
         else:
             project_id = existing_project_id
             
         print(f"Using Project ID: {project_id}")
         
         # Get User IDs
         user_ids = {}
         for email in emails:
             res = conn.execute(text(f"SELECT id FROM users WHERE email = '{email}'"))
             user_ids[email] = res.scalar()
         
         # 4. Assign Roles
         # Clean existing members for this project first to avoid duplicates/errors
         conn.execute(text(f"DELETE FROM project_members WHERE project_id = {project_id}"))
         
         # Admin
         conn.execute(text(f"INSERT INTO project_members (project_id, user_id, role) VALUES ({project_id}, {user_ids[ADMIN_EMAIL]}, 'ADMIN')"))
         # SM
         conn.execute(text(f"INSERT INTO project_members (project_id, user_id, role) VALUES ({project_id}, {user_ids[SM_EMAIL]}, 'SCRUM_MASTER')"))
         # Dev
         conn.execute(text(f"INSERT INTO project_members (project_id, user_id, role) VALUES ({project_id}, {user_ids[DEV_EMAIL]}, 'DEVELOPER')"))
         # Tester
         conn.execute(text(f"INSERT INTO project_members (project_id, user_id, role) VALUES ({project_id}, {user_ids[TESTER_EMAIL]}, 'TESTER')"))
         # Viewer
         conn.execute(text(f"INSERT INTO project_members (project_id, user_id, role) VALUES ({project_id}, {user_ids[VIEWER_EMAIL]}, 'VIEWER')"))
         
         conn.commit()
         print("Roles assigned.")
         
         # Verification
         res = conn.execute(text(f"SELECT role FROM project_members WHERE project_id = {project_id} AND user_id = {user_ids[DEV_EMAIL]}"))
         role_check = res.scalar()
         print(f"VERIFY DB: Dev Role for PID {project_id} UID {user_ids[DEV_EMAIL]} is '{role_check}'")
         
         return project_id

def run_tests():
    project_id = setup_test_data() # Setup returns ID now
    
    print("Running Security Matrix Tests...")
    
    # Login all
    tokens = {}
    emails = [ADMIN_EMAIL, SM_EMAIL, DEV_EMAIL, TESTER_EMAIL, VIEWER_EMAIL]
    for email in emails:
        token = get_token(email)
        if not token:
            print(f"Failed to login {email}")
            return
        tokens[email] = token
        
    emails = [ADMIN_EMAIL, SM_EMAIL, DEV_EMAIL, TESTER_EMAIL, VIEWER_EMAIL]
    for email in emails:
        token = get_token(email)
        if not token:
            print(f"Failed to login {email}")
            return
        tokens[email] = token
        
    print("\n[TEST] Create Issue")
    # Expected: Viewer -> 403, Others -> 200 (assuming valid data)
    
    def create_issue(user_email, expect_success):
        headers = {"Authorization": f"Bearer {tokens[user_email]}"}
        data = {
            "title": f"Test Issue by {user_email}",
            "description": "desc",
            "release_number": "R1",
            "sprint_number": "1",
            "assignee": "Unassigned",
            "reviewer": "Unassigned",
            "status": "todo",
            "issue_type": "story"
        }
        # Parent issues handling omitted for simplicity
        
        # We need to send form-data or simpler
        res = requests.post(f"{BASE_URL}/projects/{project_id}/issues", headers=headers, data=data) # requests handles dict as form-data
        
        if expect_success:
            if res.status_code == 200:
                print(f"✅ {user_email} create success")
                return res.json()['id']
            else:
                print(f"❌ {user_email} failed create: {res.status_code} {res.text}")
        else:
            if res.status_code == 403:
                print(f"✅ {user_email} correctly blocked (403)")
            else:
                print(f"❌ {user_email} NOT blocked: {res.status_code}")
        return None

    # Test Create
    dev_issue_id = create_issue(DEV_EMAIL, True)
    tester_issue_id = create_issue(TESTER_EMAIL, True) # Tester CAN create
    create_issue(VIEWER_EMAIL, False) # Viewer CANNOT
    
    if not dev_issue_id:
        print("Skipping Update tests as create failed")
        return

    # --- TEST 2: Update Issue (Edit Details) ---
    print("\n[TEST] Update Issue (Edit Details)")
    
    def update_issue(user_email, issue_id, expect_success, desc="updated"):
        headers = {"Authorization": f"Bearer {tokens[user_email]}"}
        data = {"description": desc}
        res = requests.put(f"{BASE_URL}/user-story/{issue_id}", headers=headers, data=data)
        
        if expect_success:
            if res.status_code == 200:
                print(f"✅ {user_email} update success")
            else:
                print(f"❌ {user_email} failed update: {res.status_code} {res.text}")
        else:
            if res.status_code == 403:
                print(f"✅ {user_email} correctly blocked (403)")
            else:
                print(f"❌ {user_email} NOT blocked: {res.status_code}")

    # Dev updating OWN issue -> Success
    update_issue(DEV_EMAIL, dev_issue_id, True, "Updated by Owner")
    
    # Dev updating Tester's issue -> BLOCK (unless assigned)
    update_issue(DEV_EMAIL, tester_issue_id, False, "Hacked by Dev")
    
    # Tester updating ANY issue detail -> BLOCK
    update_issue(TESTER_EMAIL, dev_issue_id, False, "Hacked by Tester")
    
    # Viewer updating ANY issue -> BLOCK
    update_issue(VIEWER_EMAIL, dev_issue_id, False, "Hacked by Viewer")
    
    # Admin updating Dev issue -> Success
    update_issue(ADMIN_EMAIL, dev_issue_id, True, "Admin Override")

    # --- TEST 3: Change Status ---
    print("\n[TEST] Change Status")
    
    def change_status(user_email, issue_id, expect_success):
        headers = {"Authorization": f"Bearer {tokens[user_email]}"}
        data = {"new_status": "in_progress"} # Valid transition from todo?
        res = requests.post(f"{BASE_URL}/user-story/{issue_id}/status", headers=headers, json=data)
        
        if expect_success:
            if res.status_code == 200:
                print(f"✅ {user_email} status change success")
            else:
                # 400 bad request might happen if invalid transition, but we care about auth (403 or not)
                print(f"❌ {user_email} failed status: {res.status_code} {res.text}")
        else:
            if res.status_code == 403:
                print(f"✅ {user_email} correctly blocked (403)")
            else:
                print(f"❌ {user_email} NOT blocked: {res.status_code}")

    # Tester CAN change status
    # We need a fresh issue or reset status to ensure transition is valid
    # or Assume 'todo' -> 'in_progress' is valid.
    change_status(TESTER_EMAIL, tester_issue_id, True)
    
    # Viewer CANNOT change status
    change_status(VIEWER_EMAIL, dev_issue_id, False)


if __name__ == "__main__":
    try:
        setup_test_data()
        run_tests()
    except Exception as e:
        print(f"Error: {e}")
