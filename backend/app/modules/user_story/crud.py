from sqlalchemy.orm import Session
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
    
    # Initial history log - access instance attribute directly from __dict__ to get scalar value
    story_id_val: int = db_story.__dict__['id']
    log_history(db, story_id_val, "status", None, story.status)
    
    return db_story

def update_user_story_by_id(db: Session, story_id: int, story_update: schemas.UserStoryUpdateRequest):
    db_story = get_user_story_by_id(db, story_id)
    if not db_story:
        return None
    
    update_data = story_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        old_value = getattr(db_story, key)
        # Log if changed
        if str(old_value) != str(value):
            log_history(db, story_id, key, str(old_value), str(value))
        
        setattr(db_story, key, value)

    db.commit()
    db.refresh(db_story)
    return db_story

def update_user_story_status(db: Session, story_id: int, new_status: str):
    db_story = get_user_story_by_id(db, story_id)
    if not db_story:
        return None
        
    old_status = db_story.status
    
    # RULE: Parent DONE protection
    if new_status == 'done':
        # Check if any child is not done
        # Using relationship 'children'
        has_open_children = db.query(models.UserStory).filter(
            models.UserStory.parent_issue_id == story_id, 
            models.UserStory.status != 'done'
        ).count() > 0
        
        if has_open_children:
            raise ValueError("Cannot complete parent issue with open children")

    # Get the actual Python string value from old_status
    old_status_val = getattr(db_story, 'status', None)
    if old_status_val != new_status:
        log_history(db, story_id, "status", old_status_val, new_status)
    
    # Use SQLAlchemy update to avoid Column type issues
    db.query(models.UserStory).filter(models.UserStory.id == story_id).update({"status": new_status})
    db.commit()
    db.refresh(db_story)
    return db_story

def log_history(db: Session, story_id: int, field_name: str, old_value: str | None, new_value: str | None):
    history_entry = models.UserStoryHistory(
        story_id=story_id,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value
    )
    db.add(history_entry)
    # Note: commit might be handled by caller, but safe to add to session. 
    # If caller commits, this commits. If caller rolls back, this rolls back.
    # To be safe and ensure ID generation if needed immediately, we could flush/commit,
    # but usually part of the same transaction.
    # We'll let the main update commit finalize this.

def get_story_history(db: Session, story_id: int):
    return db.query(models.UserStoryHistory).filter(models.UserStoryHistory.story_id == story_id).order_by(models.UserStoryHistory.changed_at.desc()).all()
