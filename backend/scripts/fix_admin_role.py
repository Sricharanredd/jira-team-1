import sys
import os
from sqlalchemy import create_engine, text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import DATABASE_URL

def fix_admin_and_audit():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("--- Fixing Admin Preferred Role ---")
        email = "admin@admin.com"
        conn.execute(text("UPDATE users SET preferred_role = 'DEVELOPER' WHERE email = :email"), {"email": email})
        conn.commit()
        print(f"Updated {email} preferred_role to DEVELOPER.")

        print("\n--- Auditing Project Memberships ---")
        result = conn.execute(text("SELECT pm.project_id, pm.user_id, u.email, pm.role FROM project_members pm JOIN users u ON pm.user_id = u.id"))
        for row in result:
             print(f"Project: {row[0]}, User: {row[2]}, Role: {row[3]}")

if __name__ == "__main__":
    fix_admin_and_audit()
