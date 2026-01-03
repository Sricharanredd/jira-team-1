from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import os
import shutil

from app.database import get_db
from app.modules.user_story import crud as story_crud, models as story_models, schemas as story_schemas
from app.modules.auth import models as auth_models, dependencies as auth_deps
from app.modules.project import crud as project_crud
from app.modules.workflow import crud as workflow_crud

router = APIRouter(
    tags=["User Stories"]
)

UPLOAD_BASE_DIR = "uploads/user_stories"
os.makedirs(UPLOAD_BASE_DIR, exist_ok=True)

@router.get("/user-story", response_model=list[story_schemas.UserStoryResponse])
def get_all_user_stories(
    project_id: int | None = None,
    db: Session = Depends(get_db)
):
    # TODO: This should probably be administrative or removed to enforce project boundaries.
    stories = story_crud.get_all_user_stories(db, project_id)
    return [
        {
            "id": s.id,
            "project_id": s.project_id,
            "project_name": s.project.project_name,
            "release_number": s.release_number,
            "sprint_number": s.sprint_number,
            "story_code": s.story_code,
            "assignee": s.assignee,
            "reviewer": s.reviewer,
            "title": s.title,
            "description": s.description,
            "status": s.status,
            "issue_type": s.issue_type,
            "parent_issue_id": s.parent_issue_id,
            "support_doc": os.path.basename(s.support_doc_path) if s.support_doc_path else None,
        }
        for s in stories
    ]

@router.get("/user-story/{story_id}", response_model=story_schemas.UserStoryResponse)
def get_user_story(
    story_id: int, 
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    story = story_crud.get_user_story_by_id(db, story_id)

    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
        
    # Check Read Access (Viewer or above)
    user_role = auth_deps.get_current_user_role(story.project_id, db, current_user)
    if not user_role:
          raise HTTPException(status_code=403, detail="Permission denied.")

    return {
        "id": story.id,
        "project_id": story.project_id,
        "project_name": story.project.project_name,
        "release_number": story.release_number,
        "sprint_number": story.sprint_number,
        "story_code": story.story_code,
        "assignee": story.assignee,
        "reviewer": story.reviewer,
        "title": story.title,
        "description": story.description,
        "status": story.status,
        "issue_type": story.issue_type,
        "parent_issue_id": story.parent_issue_id,
        "support_doc": os.path.basename(story.support_doc_path) if story.support_doc_path else None,
    }


@router.post("/user-story/{story_id}/status", response_model=story_schemas.UserStoryResponse)
def update_user_story_status(
    story_id: int,
    status_update: story_schemas.UserStoryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    try:
        # Validate Transition
        current_story = story_crud.get_user_story_by_id(db, story_id)
        if not current_story:
            raise HTTPException(status_code=404, detail="Story not found")
            
        # Permission Check (ADMIN, SM, DEV, TESTER)
        user_role = auth_deps.get_current_user_role(current_story.project_id, db, current_user)
        
        if not user_role or not auth_deps.Permissions.can_change_status(user_role):
             raise HTTPException(status_code=403, detail="Permission denied. Viewers cannot update status.")

        if not workflow_crud.is_transition_valid(db, current_story.status, status_update.new_status):
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid transition from {current_story.status} to {status_update.new_status}"
            )

        updated_story = story_crud.update_user_story_status(db, story_id, status_update.new_status)
        if not updated_story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        return {
            "id": updated_story.id,
            "project_id": updated_story.project_id,
            "project_name": updated_story.project.project_name,
            "release_number": updated_story.release_number,
            "sprint_number": updated_story.sprint_number,
            "story_code": updated_story.story_code,
            "assignee": updated_story.assignee,
            "reviewer": updated_story.reviewer,
            "title": updated_story.title,
            "description": updated_story.description,
            "status": updated_story.status,
            "issue_type": updated_story.issue_type,
            "parent_issue_id": updated_story.parent_issue_id,
            "support_doc": os.path.basename(updated_story.support_doc_path) if updated_story.support_doc_path else None,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/user-story/{id}")
def update_user_story(
    id: int,
    # Editable fields
    title: str | None = Form(None),
    description: str | None = Form(None),
    sprint_number: str | None = Form(None),
    assignee: str | None = Form(None),
    reviewer: str | None = Form(None),
    status: str | None = Form(None),
    user_id: int | None = Form(None), # Not used directly?
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    # Manual Permission Check
    current_story = story_crud.get_user_story_by_id(db, id)
    if not current_story:
         raise HTTPException(status_code=404, detail="Story not found")

    # Check Role
    user_role = auth_deps.get_current_user_role(current_story.project_id, db, current_user)
    
    if not user_role:
         raise HTTPException(status_code=403, detail="Permission denied.")

    # 1. Admin / Scrum Master: All Access
    if auth_deps.Permissions.can_edit_all_issues(user_role):
        pass # Allowed

    # 2. Developer: Own or Assigned Only
    elif auth_deps.Permissions.can_edit_own_issues(user_role):
        is_creator = current_story.created_by == current_user.id
        # Note: Assignee is a name string, so we try to match it carefully or loosely
        is_assignee = current_story.assignee == current_user.name 
        
        if not (is_creator or is_assignee):
            raise HTTPException(
                status_code=403, 
                detail="Permission denied. Developers can only edit issues they created or are assigned to."
            )
            
    # 3. Tester / Viewer: No Edit Access (Except Status via other endpoint)
    else:
         raise HTTPException(
             status_code=403, 
             detail="Permission denied. Testers and Viewers cannot edit issue details."
         )

    # Only include fields that are NOT empty strings and NOT None
    update_data = {}
    
    if title is not None and title.strip() != "":
        update_data['title'] = title
    if description is not None and description.strip() != "":
        update_data['description'] = description
    if sprint_number is not None and sprint_number.strip() != "":
        update_data['sprint_number'] = sprint_number
    if assignee is not None and assignee.strip() != "":
        update_data['assignee'] = assignee
    if reviewer is not None and reviewer.strip() != "":
        update_data['reviewer'] = reviewer
    
    # Handle status update with validation
    if status is not None and status.strip() != "":
        if status != current_story.status:
            if not workflow_crud.is_transition_valid(db, current_story.status, status):
                 raise HTTPException(status_code=400, detail=f"Invalid status transition from {current_story.status} to {status}")
            update_data['status'] = status
        
    story_data = story_schemas.UserStoryUpdateRequest(**update_data)
    
    updated = story_crud.update_user_story_by_id(db, id, story_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Story not found")
        
    return {
        "id": updated.id,
        "project_id": updated.project_id,
        "project_name": updated.project.project_name,
        "release_number": updated.release_number,
        "sprint_number": updated.sprint_number,
        "story_code": updated.story_code,
        "assignee": updated.assignee,
        "reviewer": updated.reviewer,
        "title": updated.title,
        "description": updated.description,
        "status": updated.status,
        "issue_type": updated.issue_type,
        "parent_issue_id": updated.parent_issue_id,
        "support_doc": os.path.basename(updated.support_doc_path) if updated.support_doc_path else None,
    }

@router.get("/user-story/{id}/history", response_model=list[story_schemas.UserStoryHistoryResponse], tags=["Workflow"])
def get_story_history(id: int, db: Session = Depends(get_db)):
    return story_crud.get_story_history(db, id)


@router.delete("/user-story/{story_id}")
def delete_user_story(
    story_id: int, 
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    # Manual Permission Check
    current_story = story_crud.get_user_story_by_id(db, story_id)
    if not current_story:
         raise HTTPException(status_code=404, detail="Story not found")

    user_role = auth_deps.get_current_user_role(current_story.project_id, db, current_user)
    if user_role != auth_models.RoleType.ADMIN:
         raise HTTPException(status_code=403, detail="Permission denied. Only ADMIN can delete issues.")

    deleted = story_crud.delete_user_story_by_id(db, story_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Story not found")

    story_folder = os.path.join(UPLOAD_BASE_DIR, str(story_id))
    if os.path.exists(story_folder):
        shutil.rmtree(story_folder)

    return {"message": "User story and support documents deleted successfully"}
