import sys
import os
from sqlalchemy import text

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.modules.auth import models

def test_insert_member():
    db = SessionLocal()
    try:
        print("TEST: Attempting to insert a ProjectMember with role='MEMBER'...")
        
        # Get a user and project
        user = db.query(models.User).first()
        project = db.query(models.Project).first()
        
        if not user or not project:
            print("Skipping test: No user or project found.")
            return

        # Check existing
        member = db.query(models.ProjectMember).filter_by(user_id=user.id, project_id=project.id).first()
        
        if member:
            print(f"Updating existing member (Role: {member.role}) to MEMBER")
            member.role = models.RoleType.MEMBER
        else:
            print("Creating new member with role MEMBER")
            member = models.ProjectMember(
                 user_id=user.id,
                 project_id=project.id,
                 role=models.RoleType.MEMBER
            )
            db.add(member)
        
        db.commit()
        db.refresh(member)
        
        if member.role == models.RoleType.MEMBER: 
             print("SUCCESS: Role is correctly saved as MEMBER.")
        else:
             print(f"FAILURE: Role is {member.role}")

    except Exception as e:
        print(f"FAILURE: Database rejected the operation.")
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_insert_member()
