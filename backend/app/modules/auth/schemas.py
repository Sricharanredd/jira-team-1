from pydantic import BaseModel
from typing import Optional, List

from app.modules.auth.models import GlobalRole, PreferredRole

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int] = None
    email: Optional[str] = None
    name: Optional[str] = None
    global_role: Optional[GlobalRole] = None
    preferred_role: Optional[PreferredRole] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    confirm_password: str
    role: Optional[PreferredRole] = PreferredRole.VIEWER

class ProjectRole(BaseModel):
    id: int
    project_name: str
    project_prefix: str
    role: str

    class Config:
        orm_mode = True

