import sys
import os
from sqlalchemy import create_engine, text

# Add the parent directory to sys.path to import app modules if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import DATABASE_URL as SQLALCHEMY_DATABASE_URL

def migrate():
    print("Starting RBAC Migration...")
    
    # Connect to DB
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as connection:
        # 1. Add global_role column to users table if it doesn't exist
        print("Checking/Adding global_role to users table...")
        try:
            # Check if column exists
            result = connection.execute(text("SHOW COLUMNS FROM users LIKE 'global_role'"))
            if not result.fetchone():
                print("Adding global_role column...")
                connection.execute(text("ALTER TABLE users ADD COLUMN global_role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER'"))
                print("global_role column added.")
            else:
                print("global_role column already exists.")
        except Exception as e:
            print(f"Error adding global_role: {e}")

        # 2. Update RoleType ENUM in project_members table
        print("Updating project_members role ENUM...")
        try:
            # In MySQL, modifying an ENUM column requires listing all values
            # We are adding SCRUM_MASTER, DEVELOPER, TESTER and removing MEMBER (mapping to DEVELOPER/VIEWER if needed)
            
            # First, check if there are any 'MEMBER' roles and map them to 'DEVELOPER' (or whatever default)
            print("Migrating old 'MEMBER' roles to 'DEVELOPER'...")
            connection.execute(text("UPDATE project_members SET role = 'DEVELOPER' WHERE role = 'MEMBER'"))
            
            # Now alter the column definition
            print("Altering project_members.role column definition...")
            connection.execute(text("ALTER TABLE project_members MODIFY COLUMN role ENUM('ADMIN', 'SCRUM_MASTER', 'DEVELOPER', 'TESTER', 'VIEWER') NOT NULL DEFAULT 'VIEWER'"))
            print("project_members.role column updated.")
            
        except Exception as e:
            print(f"Error updating project_members role: {e}")
            # If it fails, it might be because of data truncation or invalid values. 
            # But the UPDATE above should handle it.

        print("Migration completed.")

if __name__ == "__main__":
    migrate()
