import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.modules.auth import models, crud
from sqlalchemy.exc import DataError, StatementError

def diagnose():
    db = SessionLocal()
    try:
        # Create a dummy user and project to test assignment
        # We'll just try to insert a dummy record or check existing types?
        # Let's try to assign a role to an existing user if possible, or verify Enum behavior.
        
        print("Checking RoleType Enum in Python...")
        print(f"Allowed roles: {[r.value for r in models.RoleType]}")
        
        if "MEMBER" not in [r.value for r in models.RoleType]:
             print("CRITICAL: MEMBER is not in RoleType Enum!")
             return

        # Try to execute a raw query to check column definition if possible?
        # Or just try to insert.
        
        # Checking if we can update a role to MEMBER
        print("Attempting to insert a ProjectMember with role='MEMBER'...")
        
        # Create a ephemeral test user/project logic is complex.
        # Let's just try to instantiate the model and add to session.
        # We need valid FKs.
        
        # Let's fetch first user and first project
        user = db.query(models.User).first()
        project = db.query(models.Project).first()
        
        if not user or not project:
            print("No user or project found to test.")
            return

        print(f"Using User ID: {user.id}, Project ID: {project.id}")
        
        # Check existing member
        member = db.query(models.ProjectMember).filter_by(user_id=user.id, project_id=project.id).first()
        
        if member:
            print(f"Found existing member with role: {member.role}")
            print("Attempting update to MEMBER")
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
        print("SUCCESS: Role updated/inserted to MEMBER in DB.")
        
    except Exception as e:
        print(f"FAILURE: Database rejected the operation.")
        print(f"Error Type: {type(e)}")
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    diagnose()
