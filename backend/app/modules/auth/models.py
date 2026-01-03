from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base

class RoleType(str, enum.Enum):
    ADMIN = "ADMIN"
    SCRUM_MASTER = "SCRUM_MASTER"
    DEVELOPER = "DEVELOPER"
    TESTER = "TESTER"
    VIEWER = "VIEWER"

class GlobalRole(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class PreferredRole(str, enum.Enum):
    DEVELOPER = "DEVELOPER"
    TESTER = "TESTER"
    VIEWER = "VIEWER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    global_role = Column(Enum(GlobalRole), default=GlobalRole.USER, nullable=False)
    preferred_role = Column(Enum(PreferredRole), default=PreferredRole.VIEWER, nullable=True)

    project_memberships = relationship("ProjectMember", back_populates="user")

class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(RoleType), default=RoleType.VIEWER, nullable=False)

    user = relationship("User", back_populates="project_memberships")
    # Assuming Project model has a relationship back to members if needed, 
    # but for now we just need the ForeignKey. 
    # If we want to access project from here:
    # project = relationship("Project") 
