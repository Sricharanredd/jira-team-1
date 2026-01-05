from sqlalchemy.orm import Session
from app.modules.auth import models, schemas, security
from app.modules.project.models import Project

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, global_role: models.GlobalRole):
    # Bcrypt has a 72 byte limit. 
    # We must truncate BYTES, not characters.
    pwd_bytes = user.password.encode('utf-8')
    
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
        # Decode back to string for passlib, ignoring partial chars at end
        truncated_pwd = pwd_bytes.decode('utf-8', errors='ignore')
    else:
        truncated_pwd = user.password
        
    hashed_password = security.get_password_hash(truncated_pwd)
    
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        is_active=True,
        global_role=global_role, # Passed from arg
        preferred_role=user.role # Mapped from new schema field
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_role(db: Session, user_id: int, project_id: int):
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.user_id == user_id,
        models.ProjectMember.project_id == project_id
    ).first()
    print(f"DEBUG: get_user_role uid={user_id} pid={project_id} member={member}")
    
    if member:
        return member.role
    return None

def assign_role(db: Session, user_id: int, project_id: int, role: models.RoleType):
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.user_id == user_id,
        models.ProjectMember.project_id == project_id
    ).first()

    print(f"DEBUG: assign_role UID={user_id} PID={project_id} TARGET_ROLE={role} EXISTING={member.role if member else 'None'}")

    if member:
        member.role = role
    else:
        member = models.ProjectMember(user_id=user_id, project_id=project_id, role=role)
        db.add(member)
    
    db.commit()
    return member

def get_user_projects(db: Session, user_id: int):
    # Join Project and ProjectMember
    results = db.query(Project, models.ProjectMember.role).join(
        models.ProjectMember, 
        models.ProjectMember.project_id == Project.id
    ).filter(
        models.ProjectMember.user_id == user_id
    ).all()
    
    # Format as list of dicts or return as is to let schema handle it?
    # Better to return structured data
    projects = []
    for proj, role in results:
        projects.append({
            "id": proj.id,
            "project_name": proj.project_name,
            "project_prefix": proj.project_prefix,
            "role": role
        })
    return projects

def remove_project_member(db: Session, user_id: int, project_id: int):
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.user_id == user_id,
        models.ProjectMember.project_id == project_id
    ).first()
    
    if member:
        db.delete(member)
        db.commit()
        return True
    return False
