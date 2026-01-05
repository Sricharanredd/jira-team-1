from pydantic import BaseModel
from typing import Optional

# General Settings
class GeneralSettingsBase(BaseModel):
    workspace_name: str
    default_timezone: str
    date_format: str
    time_format: str

class GeneralSettingsUpdate(GeneralSettingsBase):
    pass

class GeneralSettingsOut(GeneralSettingsBase):
    pass

# Security Settings
class SecuritySettingsBase(BaseModel):
    password_min_length: int
    password_require_uppercase: bool
    password_require_number: bool
    password_require_symbol: bool

class SecuritySettingsUpdate(SecuritySettingsBase):
    pass

class SecuritySettingsOut(SecuritySettingsBase):
    pass

# Users (Read-Only List)
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    
    class Config:
        from_attributes = True

# System Stats
class SystemStats(BaseModel):
    total_users: int
    total_projects: int
    total_issues: int
    version: str
