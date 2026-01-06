from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from typing import Dict, Any
import json
from . import models, schemas
from app.modules.project import models as project_models

# Fetch all user stories, optionally filtered by project_id for project-specific views
def get_all_user_stories(db: Session, project_id: int | None = None):
    query = db.query(models.UserStory)
    if project_id:
        query = query.filter(models.UserStory.project_id == project_id)
    return query.all()

# Get single user story by unique ID for detail view and updates
def get_user_story_by_id(db: Session, story_id: int):
    return db.query(models.UserStory).filter(models.UserStory.id == story_id).first()

# Auto-generate unique story code in format PREFIX-0001 for each new issue
# Uses project prefix and increments number based on last story in project
def generate_story_code(db: Session, project_id: int) -> str:
    # Fetch Project to get prefix
    project = db.query(project_models.Project).filter(project_models.Project.id == project_id).first()
    if not project:
        raise ValueError("Project not found")
        
    # Find the last created story to determine the next number
    last_story = db.query(models.UserStory)\
        .filter(models.UserStory.project_id == project_id)\
        .order_by(models.UserStory.id.desc())\
        .first()

    if last_story:
        # Get the actual Python string value, not the Column object
        story_code_val = getattr(last_story, 'story_code', None)
        if story_code_val:
            try:
                # Assumes format "PREFIX-0001"
                last_num = int(story_code_val.split('-')[-1])
                next_num = last_num + 1
            except (ValueError, IndexError):
                # Fallback if code format is weird
                count = db.query(models.UserStory).filter(models.UserStory.project_id == project_id).count()
                next_num = count + 1
        else:
            next_num = 1
    else:
        next_num = 1
    
    # Use project_prefix preferred, fallback to name if empty
    # Extract actual values to avoid Column type issues
    prefix_raw = getattr(project, 'project_prefix', None)
    name_raw = getattr(project, 'project_name', '')
    prefix_val = prefix_raw if prefix_raw else name_raw[:2].upper()
    
    return f"{prefix_val}-{next_num:04d}"

# Create new user story/epic/task with auto-generated code and hierarchy validation
# Validates parent-child relationships (Epic > Story > Task > Subtask) before creation
def create_user_story(db: Session, story: schemas.UserStoryCreate, file_path: str | None, user_id: int | None = None):
    print(f"DEBUG: create_user_story called with user_id={user_id}")
    if user_id is None:
        print("WARNING: user_id is None, falling back to 1 (System Admin)")
        user_id = 1
        
    # 1. Generate Story Code (Centralized)
    try:
        story_code = generate_story_code(db, story.project_id)
    except ValueError as e:
        raise ValueError(str(e)) # Re-raise
    
    # ---------------- Hierarchy Validation ----------------
    parent_id = story.parent_issue_id
    issue_type = story.issue_type

    if issue_type == schemas.IssueType.epic:
        if parent_id is not None:
             raise ValueError("Epics cannot have a parent issue.")

    elif issue_type == schemas.IssueType.story:
        if parent_id is None:
             raise ValueError("Stories must belong to an Epic.")
        parent = db.query(models.UserStory).get(parent_id)
        if not parent:
             raise ValueError("Parent Epic not found.")
        if parent.issue_type != schemas.IssueType.epic:
             raise ValueError(f"Story parent must be an Epic, got {parent.issue_type}.")

    elif issue_type == schemas.IssueType.task:
        if parent_id is None:
             raise ValueError("Tasks must belong to a Story.")
        parent = db.query(models.UserStory).get(parent_id)
        if not parent:
             raise ValueError("Parent Story not found.")
        if parent.issue_type != schemas.IssueType.story:
             raise ValueError(f"Task parent must be a Story, got {parent.issue_type}.")

    elif issue_type == schemas.IssueType.subtask:
        if parent_id is None:
             raise ValueError("Subtasks must belong to a Task.")
        parent = db.query(models.UserStory).get(parent_id)
        if not parent:
             raise ValueError("Parent Task not found.")
        if parent.issue_type != schemas.IssueType.task:
             raise ValueError(f"Subtask parent must be a Task, got {parent.issue_type}.")

    elif issue_type == schemas.IssueType.bug:
        if parent_id:
            parent = db.query(models.UserStory).get(parent_id)
            if not parent:
                raise ValueError("Parent issue not found.")
            if parent.issue_type not in [schemas.IssueType.story, schemas.IssueType.task]:
                raise ValueError(f"Bug parent must be a Story or Task, got {parent.issue_type}.")
    # ------------------------------------------------------

    db_story = models.UserStory(
        project_id=story.project_id,
        release_number=story.release_number,
        sprint_number=story.sprint_number if story.sprint_number else "", # Convert None to empty string
        story_code=story_code,
        assignee=story.assignee,
        reviewer=story.reviewer,
        title=story.title,
        description=story.description,
        status=story.status,
        issue_type=story.issue_type,
        parent_issue_id=parent_id,
        support_doc_path=file_path,
        start_date=story.start_date,
        end_date=story.end_date,
        created_by=user_id # Save creator
    )
    db.add(db_story)
    db.flush() # Flush to get ID, do not commit yet
    db.refresh(db_story)
    
    # Initial activity log for creation
    story_id_val: int = db_story.__dict__['id']
    
    # Log creation as an activity
    change_lines = [
        f"Status: None → {story.status}",
        f"Title: None → {story.title}"
    ]
    changes_text = "\n".join(change_lines)
    
    activity = models.UserStoryActivity(
        story_id=story_id_val,
        user_id=user_id,
        action="CREATED",
        changes=changes_text,
        change_count=2
    )
    db.add(activity)
    
    return db_story

def update_user_story_by_id(
    db: Session, 
    story_id: int, 
    story_update: schemas.UserStoryUpdateRequest,
    user_id: int | None = None
):
    """
    Update user story with transaction-based aggregated change logging.
    All field changes in one save action are logged as ONE activity record.
    
    Args:
        db: Database session
        story_id: ID of the story to update
        story_update: Update data with changed fields only
        user_id: ID of user making the change (for audit trail)
    
    Returns:
        Updated story object or None if not found
    """
    try:
        # Start transaction (autoflush=False ensures we control when DB writes happen)
        db_story = get_user_story_by_id(db, story_id)
        if not db_story:
            return None
        
        # Extract update data (only fields that were provided)
        update_data = story_update.dict(exclude_unset=True)
        
        if not update_data:
            # No changes to apply
            return db_story
        
        # Build changes dictionary for fields that actually changed
        changes: Dict[str, Dict[str, Any]] = {}
        change_lines = []
        
        for field_name, new_value in update_data.items():
            old_value = getattr(db_story, field_name)
            
            # Convert datetime objects to strings for comparison and JSON serialization
            if isinstance(old_value, datetime):
                old_value_str = old_value.isoformat() if old_value else None
            else:
                old_value_str = str(old_value) if old_value is not None else None
                
            if isinstance(new_value, datetime):
                new_value_str = new_value.isoformat() if new_value else None
            else:
                new_value_str = str(new_value) if new_value is not None else None
            
            # Only log if value actually changed
            if old_value_str != new_value_str:
                changes[field_name] = {
                    "old": old_value_str,
                    "new": new_value_str
                }
                # Format as readable text
                field_display = field_name.replace('_', ' ').title()
                old_display = old_value_str or 'None'
                new_display = new_value_str or 'None'
                change_lines.append(f"{field_display}: {old_display} → {new_display}")
                
                # Apply the change to the model
                setattr(db_story, field_name, new_value)
        
        # If no actual changes detected, return without logging
        if not changes:
            return db_story
        
        # Create readable text from changes
        changes_text = "\n".join(change_lines)
        
        # Create single aggregated activity record
        activity = models.UserStoryActivity(
            story_id=story_id,
            user_id=user_id,
            action="UPDATED",
            changes=changes_text,  # Store as formatted text
            change_count=len(changes)
        )
        db.add(activity)
        
        # Commit transaction (both story update and activity log)
        db.commit()
        db.refresh(db_story)
        
        return db_story
        
    except SQLAlchemyError as e:
        # Rollback on any database error
        db.rollback()
        print(f"ERROR updating story {story_id}: {str(e)}")
        raise ValueError(f"Database error during update: {str(e)}")
    except Exception as e:
        db.rollback()
        print(f"UNEXPECTED ERROR updating story {story_id}: {str(e)}")
        raise

def update_user_story_status(db: Session, story_id: int, new_status: str, user_id: int | None = None):
    """
    Update user story status with workflow validation and activity logging.
    
    Args:
        db: Database session
        story_id: ID of the story to update
        new_status: New status value
        user_id: ID of user making the change
    
    Returns:
        Updated story object or None if not found
    """
    try:
        db_story = get_user_story_by_id(db, story_id)
        if not db_story:
            return None
        
        # Get current status value
        old_status_value = str(db_story.status)
        
        # RULE: Parent DONE protection
        if new_status == 'done':
            # Check if any child is not done
            has_open_children = db.query(models.UserStory).filter(
                models.UserStory.parent_issue_id == story_id, 
                models.UserStory.status != 'done'
            ).count() > 0
            
            if has_open_children:
                raise ValueError("Cannot complete parent issue with open children")
        
        # Only update and log if status actually changed
        if old_status_value != new_status:
            # Update status using query to avoid type issues
            db.query(models.UserStory).filter(
                models.UserStory.id == story_id
            ).update({"status": new_status})
            
            # Create activity record for status change
            changes_text = f"Status: {old_status_value} → {new_status}"
            
            activity = models.UserStoryActivity(
                story_id=story_id,
                user_id=user_id,
                action="STATUS_CHANGED",
                changes=changes_text,
                change_count=1
            )
            db.add(activity)
            
            db.commit()
            db.refresh(db_story)
        
        return db_story
        
    except SQLAlchemyError as e:
        db.rollback()
        print(f"ERROR updating status for story {story_id}: {str(e)}")
        raise ValueError(f"Database error during status update: {str(e)}")
    except Exception as e:
        db.rollback()
        raise

def get_story_activity(db: Session, story_id: int):
    """
    Get aggregated activity history for a story.
    Returns activities in reverse chronological order.
    """
    return db.query(models.UserStoryActivity)\
        .filter(models.UserStoryActivity.story_id == story_id)\
        .order_by(models.UserStoryActivity.created_at.desc())\
        .all()


def delete_user_story_by_id(db: Session, story_id: int):
    """
    Delete a user story by ID.
    Returns True if deleted, False if not found.
    """
    db_story = get_user_story_by_id(db, story_id)
    if not db_story:
        return False
    
    db.delete(db_story)
    db.commit()
    return True

