import sys
import os
from sqlalchemy import text

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal

def migrate_enum():
    db = SessionLocal()
    try:
        print("Starting Migration: Update ENUM to include MEMBER...")
        
        # 1. Update existing 'USER' to 'MEMBER' if we can? 
        # But we can't update if the value isn't allowed? 
        # Wait, if we modify the enum to include BOTH, then update, then remove USER?
        # Or just Modify to include both first.
        
        # Step 1: Modify Enum to include MEMBER (and keep USER for now to avoid errors)
        # Note: MySQL ALter Table might require full definition.
        
        print("Modifying Column to allow ADMIN, MEMBER, USER, VIEWER...")
        db.execute(text("ALTER TABLE project_members MODIFY COLUMN role ENUM('ADMIN', 'MEMBER', 'USER', 'VIEWER') NOT NULL DEFAULT 'VIEWER'"))
        
        # Step 2: Update Data
        print("Migrating data: USER -> MEMBER...")
        db.execute(text("UPDATE project_members SET role='MEMBER' WHERE role='USER'"))
        
        # Step 3: Cleanup Enum (Remove USER)
        print("Cleaning up Enum: Removing USER...")
        db.execute(text("ALTER TABLE project_members MODIFY COLUMN role ENUM('ADMIN', 'MEMBER', 'VIEWER') NOT NULL DEFAULT 'VIEWER'"))
        
        db.commit()
        print("SUCCESS: Migration Complete. 'MEMBER' is now the standard.")
        
    except Exception as e:
        print(f"FAILURE: Migration Failed.")
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_enum()
