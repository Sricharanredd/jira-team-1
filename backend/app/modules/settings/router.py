from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.modules.auth import dependencies as auth_deps
from app.modules.auth import models as auth_models
from app.modules.project import models as project_models
from app.modules.user_story import models as story_models
from . import models, schemas

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)

# HELPER: Ensure settings exist
def get_or_create_settings(db: Session):
    settings = db.query(models.GlobalSettings).first()
    if not settings:
        settings = models.GlobalSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

# --- GENERAL ---
@router.get("/general", response_model=schemas.GeneralSettingsOut)
def get_general_settings(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    settings = get_or_create_settings(db)
    return settings

@router.put("/general", response_model=schemas.GeneralSettingsOut)
def update_general_settings(
    data: schemas.GeneralSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    # TODO: Add isAdmin check here
    settings = get_or_create_settings(db)
    settings.workspace_name = data.workspace_name
    settings.default_timezone = data.default_timezone
    settings.date_format = data.date_format
    settings.time_format = data.time_format
    db.commit()
    db.refresh(settings)
    return settings

# --- USERS (Read Only) ---
@router.get("/users", response_model=List[schemas.UserOut])
def get_users(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    users = db.query(auth_models.User).all()
    return users

# --- SECURITY ---
@router.get("/security", response_model=schemas.SecuritySettingsOut)
def get_security_settings(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    settings = get_or_create_settings(db)
    return settings

@router.put("/security", response_model=schemas.SecuritySettingsOut)
def update_security_settings(
    data: schemas.SecuritySettingsUpdate,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    # TODO: Add isAdmin check here
    settings = get_or_create_settings(db)
    settings.password_min_length = data.password_min_length
    settings.password_require_uppercase = data.password_require_uppercase
    settings.password_require_number = data.password_require_number
    settings.password_require_symbol = data.password_require_symbol
    db.commit()
    db.refresh(settings)
    return settings

# --- SYSTEM (Stats) ---
@router.get("/system", response_model=schemas.SystemStats)
def get_system_stats(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    total_users = db.query(func.count(auth_models.User.id)).scalar()
    total_projects = db.query(func.count(project_models.Project.id)).scalar()
    total_issues = db.query(func.count(story_models.UserStory.id)).scalar()
    
    return {
        "total_users": total_users,
        "total_projects": total_projects,
        "total_issues": total_issues,
        "version": "v1.0"
    }
