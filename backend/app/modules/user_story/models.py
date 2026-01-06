from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base

class UserStory(Base):
    __tablename__ = "user_story"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    
    release_number = Column(String(50), nullable=False)
    sprint_number = Column(String(50), nullable=False)
    story_code = Column(String(50), nullable=False) # e.g. BA-0001
    
    assignee = Column(String(100), nullable=False)
    reviewer = Column(String(100), nullable=False)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    status = Column(String(50), nullable=False)
    issue_type = Column(String(20), nullable=False, default="story")

    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)

    support_doc_path = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True) # key for RBAC ownership
    
    # Hierarchy
    parent_issue_id = Column(Integer, ForeignKey("user_story.id", ondelete="CASCADE"), nullable=True)

    # Relationships
    project = relationship("app.modules.project.models.Project")
    
    # Self-referential relationship
    parent = relationship("UserStory", remote_side=[id], backref="children")

    # Constraints
    __table_args__ = (
        UniqueConstraint('project_id', 'story_code', name='unique_project_story_code'),
        # UniqueConstraint('project_id', 'title', name='unique_project_title'), -- REMOVED to allow duplicate titles
    )


class UserStoryActivity(Base):
    """
    Aggregated activity log for user story changes.
    Each record represents ONE save action with multiple field changes.
    """
    __tablename__ = "user_story_activity"

    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("user_story.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    action = Column(String(50), nullable=False, default="UPDATED")  # UPDATED, CREATED, STATUS_CHANGED, etc.
    changes = Column(Text, nullable=False)  # Human-readable text description of changes
    change_count = Column(Integer, nullable=False, default=0)  # Number of fields changed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    story = relationship("UserStory", backref="activities")
    user = relationship("app.modules.auth.models.User")

