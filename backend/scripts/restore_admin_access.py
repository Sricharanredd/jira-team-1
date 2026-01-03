import sys
import os
from sqlalchemy import create_engine, text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import DATABASE_URL

def restore_project_admin():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        email = "sricharanreddyk33@gmail.com"
        print(f"Restoring Project ADMIN access for {email}...")
        
        # Get User ID
        result = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email})
        user_row = result.fetchone()
        if not user_row:
            print("User not found!")
            return
        user_id = user_row[0]
        
        # Force Update Role to ADMIN for all projects this user is a member of
        # (Assuming they created them or should be admin)
        # Use proper Enum value 'ADMIN'
        conn.execute(text("UPDATE project_members SET role = 'ADMIN' WHERE user_id = :uid"), {"uid": user_id})
        conn.commit()
        
        print(f"User {email} (ID: {user_id}) set to ADMIN on all their projects.")

        # Verify
        result = conn.execute(text("SELECT project_id, role FROM project_members WHERE user_id = :uid"), {"uid": user_id})
        for row in result:
             print(f"Project: {row[0]}, Role: {row[1]}")

if __name__ == "__main__":
    restore_project_admin()
