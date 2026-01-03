from sqlalchemy import Column, Integer, String
from app.database import Base

class Project(Base):
    __tablename__ = "project"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(100), unique=True, nullable=False)
    project_prefix = Column(String(10), unique=True, nullable=False)
    increment_number = Column(Integer, default=1, nullable=False)
