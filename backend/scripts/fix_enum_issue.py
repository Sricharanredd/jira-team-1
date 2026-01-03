import sys
import os
from sqlalchemy import create_engine, text

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import DATABASE_URL as SQLALCHEMY_DATABASE_URL

def fix_enum():
    print("Starting ENUM Fix for project_members...")
    
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Use engine.begin() for transaction management
    with engine.connect() as connection:
        try:
            # 1. Check current columns (Optional debugging)
            print("Inspecting current column...")
            result = connection.execute(text("SHOW COLUMNS FROM project_members LIKE 'role'"))
            row = result.fetchone()
            print(f"Current definition: {row}")

            # 2. Update existing 'MEMBER' to 'DEVELOPER'
            # We need to do this carefully. If 'MEMBER' is currently valid, we change data.
            print("Updating 'MEMBER' roles to 'DEVELOPER'...")
            connection.execute(text("UPDATE project_members SET role = 'DEVELOPER' WHERE role = 'MEMBER'"))
            connection.commit()
            print("Data update committed.")

            # 3. Alter the Table
            # Note: If 'MEMBER' is no longer in data, we can remove it from Enum
            print("Altering table column definition...")
            connection.execute(text("ALTER TABLE project_members MODIFY COLUMN role ENUM('ADMIN', 'SCRUM_MASTER', 'DEVELOPER', 'TESTER', 'VIEWER') NOT NULL DEFAULT 'VIEWER'"))
            # DDL implicitly commits in MySQL
            print("ALTER TABLE successful.")
            
            # 4. Verify
            result = connection.execute(text("SHOW COLUMNS FROM project_members LIKE 'role'"))
            row = result.fetchone()
            print(f"New definition: {row}")
            
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    fix_enum()
