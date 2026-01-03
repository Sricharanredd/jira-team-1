from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class GlobalSettings(Base):
    __tablename__ = "global_settings"

    id = Column(Integer, primary_key=True, index=True)
    
    # General
    workspace_name = Column(String(255), default="My Workspace")
    default_timezone = Column(String(50), default="UTC")
    date_format = Column(String(20), default="YYYY-MM-DD")
    time_format = Column(String(10), default="24h")
    
    # Security (Password Rules)
    password_min_length = Column(Integer, default=8)
    password_require_uppercase = Column(Boolean, default=True)
    password_require_number = Column(Boolean, default=True)
    password_require_symbol = Column(Boolean, default=True)
