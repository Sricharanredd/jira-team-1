from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

from enum import Enum

class StoryStatus(str, Enum):
    backlog = "backlog"
    todo = "todo"
    in_progress = "in_progress"
    testing = "testing"
    done = "done"

class IssueType(str, Enum):
    epic = "epic"
    story = "story"
    task = "task"
    bug = "bug"
    subtask = "subtask"

# -------- CREATE (POST) --------
class UserStoryCreate(BaseModel):
    project_id: int = Field(..., example=1)
    release_number: str = Field(..., example="R1.0")
    sprint_number: Optional[str] = Field(default=None, example="Sprint-3")
    assignee: str = Field(..., example="Sanji")
    reviewer: str = Field(..., example="TeamLead")
    title: str = Field(..., example="Login API")
    description: str = Field(..., example="Implement login API")
    status: StoryStatus = Field(..., example="in_progress")
    issue_type: IssueType = Field(default=IssueType.story, example="story")
    parent_issue_id: Optional[int] = Field(default=None, example=10)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


# -------- UPDATE STATUS (POST) --------
class UserStoryStatusUpdate(BaseModel):
    new_status: StoryStatus = Field(..., example="in_progress")


# -------- UPDATE (PUT / PATCH) --------
class UserStoryUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sprint_number: Optional[str] = None
    assignee: Optional[str] = None
    reviewer: Optional[str] = None
    status: Optional[str] = None  # Added to allow status update via Edit form
    parent_issue_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None



# -------- ACTIVITY / HISTORY RESPONSES --------
class UserStoryActivityResponse(BaseModel):
    """
    Aggregated activity log response.
    Represents ONE save action with multiple field changes.
    """
    id: int
    story_id: int
    user_id: Optional[int]
    action: str  # UPDATED, CREATED, STATUS_CHANGED
    changes: str  # Human-readable text: "Title: old → new\nDescription: old → new"
    change_count: int  # Number of fields changed
    created_at: datetime

    class Config:
        from_attributes = True


class UserStoryResponse(BaseModel):
    id: int
    project_id: int
    project_name: str
    release_number: str
    sprint_number: str
    story_code: str
    assignee: str
    reviewer: str
    title: str
    description: str
    status: str
    issue_type: str
    parent_issue_id: Optional[int]
    support_doc: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
