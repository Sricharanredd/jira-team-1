from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, desc
from typing import List, Optional
from datetime import date, datetime, timedelta
import collections

from app.database import get_db
from app.modules.user_story import models as story_models
from app.modules.auth import dependencies as auth_deps
from app.modules.auth import models as auth_models

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.get("/calendar")
def get_calendar_data(
    month: str = Query(..., description="YYYY-MM format"),
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    try:
        start_date = datetime.strptime(month, "%Y-%m").date()
        # End date is 1st of next month
        if start_date.month == 12:
            end_date = date(start_date.year + 1, 1, 1)
        else:
            end_date = date(start_date.year, start_date.month + 1, 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")

    # Access Control for Project
    if project_id:
         if not auth_deps.get_current_user_role(project_id, db, current_user):
             raise HTTPException(status_code=403, detail="Access denied to project")
    
    # Query Issues in range
    query = db.query(story_models.UserStory).filter(
        story_models.UserStory.created_at >= start_date,
        story_models.UserStory.created_at < end_date
    )
    
    if project_id:
        query = query.filter(story_models.UserStory.project_id == project_id)
    
    # If no project_id, filter by projects user is member of
    if not project_id:
         user_projects = [p.project_id for p in current_user.project_memberships]
         query = query.filter(story_models.UserStory.project_id.in_(user_projects))

    issues = query.all()

    # Group by Date
    calendar_data = collections.defaultdict(list)
    for issue in issues:
        day_str = issue.created_at.strftime("%Y-%m-%d")
        calendar_data[day_str].append({
            "id": issue.id,
            "title": issue.title,
            "story_code": issue.story_code,
            "project_id": issue.project_id,
            # "project_name": issue.project.project_name # Lazy load risk, opt strictly for id or key
        })
    
    return calendar_data

@router.get("/timeline")
def get_timeline_data(
    days: int = 14,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth_deps.get_current_user)
):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    # 1. Fetch Issues Created
    issue_query = db.query(story_models.UserStory).filter(
        story_models.UserStory.created_at >= start_date
    )
    
    # 2. Fetch History Events
    history_query = db.query(story_models.UserStoryHistory).filter(
         story_models.UserStoryHistory.changed_at >= start_date
    )

    # 3. Apply Project Filter / Auth
    # To filter history by project, we need to join UserStory
    history_query = history_query.join(story_models.UserStory)

    if project_id:
        # Check access
        if not auth_deps.get_current_user_role(project_id, db, current_user):
             raise HTTPException(status_code=403, detail="Access denied")
        
        issue_query = issue_query.filter(story_models.UserStory.project_id == project_id)
        history_query = history_query.filter(story_models.UserStory.project_id == project_id)
    else:
        # Filter by user's projects
        user_projects = [p.project_id for p in current_user.project_memberships]
        issue_query = issue_query.filter(story_models.UserStory.project_id.in_(user_projects))
        history_query = history_query.filter(story_models.UserStory.project_id.in_(user_projects))

    issues = issue_query.all()
    history = history_query.all()

    # 4. Merge and Serialize
    events = []
    
    for issue in issues:
        events.append({
            "type": "created",
            "timestamp": issue.created_at,
            "date": issue.created_at.strftime("%Y-%m-%d"),
            "time": issue.created_at.strftime("%H:%M"),
            "project_id": issue.project_id,
            "issue_id": issue.id,
            "story_code": issue.story_code,
            "title": issue.title,
            "description": "Issue created"
        })
        
    for h in history:
        # We need story details (code, title) which are reachable via h.story if relationship exists
        # Model check: UserStoryHistory has 'story_id', but no relationship definition in the simplified model check.
        # But we joined it? SQL Alchemy Join allows filtering, but accessing properties depends on relationship.
        # Let's perform a manual lookup or eager I'll assume we queried UserStory in lines 105. 
        # Actually simplest is to fetch story data. 
        # Performance warning: N+1. 
        # For this MVP, I'll rely on lazy loading or explicit join fetch if I had time. 
        # Let's try accessing the story via query.
        
        # NOTE: The UserStoryHistory model I viewed earlier did NOT have a 'story' relationship defined. 
        # LINE 51: story_id = Column...
        # So I cannot do h.story.title.
        # I must fetch the story data manually or join-select.
        
        # Optimized: Pre-fetch relevant stories in a dict
        pass 
        
    # Optimization: Get all unique story_ids from history
    hist_story_ids = {h.story_id for h in history}
    # We might have issues from the "Created" set, but we also need stories for History items that were created BEFORE start_date
    missing_ids = hist_story_ids - {i.id for i in issues}
    if missing_ids:
        # Fetch extra stories needed for display
        extra_stories = db.query(story_models.UserStory).filter(story_models.UserStory.id.in_(missing_ids)).all()
        # Add to a dictionary map
        story_map = {s.id: s for s in issues + extra_stories}
    else:
        story_map = {s.id: s for s in issues}

    for h in history:
        story = story_map.get(h.story_id)
        if story:
            events.append({
                "type": "updated",
                "timestamp": h.changed_at,
                "date": h.changed_at.strftime("%Y-%m-%d"),
                "time": h.changed_at.strftime("%H:%M"),
                "project_id": story.project_id,
                "issue_id": story.id,
                "story_code": story.story_code,
                "title": story.title,
                "description": f"Updated {h.field_name}: {h.old_value or 'None'} -> {h.new_value or 'None'}"
            })

    # Sort
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return events
