from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.auth import crud, models, schemas
from app.config import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        if user_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(id=int(user_id), email=email)
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_id(db, user_id=token_data.id)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    return user

def require_role(roles: list[models.RoleType]):
    """
    Dependency factory to check if user has one of the required roles for the project.
    We need project_id from the request.
    """
    def dependency(project_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        if user.global_role == models.GlobalRole.ADMIN:
            user_role = models.RoleType.ADMIN
        else:
            user_role = crud.get_user_role(db, user.id, project_id)
        
        # If no role assigned, deny access
        if not user_role:
             raise HTTPException(status_code=403, detail="You are not a member of this project")
        
        if user_role not in roles:
             raise HTTPException(
                 status_code=403, 
                 detail=f"Permission denied. Required roles: {[r.value for r in roles]}. Your role: {user_role.value}"
             )
        
        return user
        
    return dependency

def get_current_user_role(project_id: int, db: Session, user: models.User):
     """
     Helper to get role for logic, requires explicit user object now.
     """
     if user.global_role == models.GlobalRole.ADMIN:
         return models.RoleType.ADMIN
     return crud.get_user_role(db, user.id, project_id)

class Permissions:
    @staticmethod
    def can_view_project(role: models.RoleType) -> bool:
        return role in [
            models.RoleType.ADMIN, 
            models.RoleType.SCRUM_MASTER, 
            models.RoleType.DEVELOPER, 
            models.RoleType.TESTER, 
            models.RoleType.VIEWER
        ]

    @staticmethod
    def can_create_issue(role: models.RoleType) -> bool:
        return role in [
            models.RoleType.ADMIN, 
            models.RoleType.SCRUM_MASTER, 
            models.RoleType.DEVELOPER, 
            models.RoleType.TESTER
        ]

    @staticmethod
    def can_manage_members(role: models.RoleType) -> bool:
        return role in [
            models.RoleType.ADMIN, 
            models.RoleType.SCRUM_MASTER
        ]

    @staticmethod
    def can_change_status(role: models.RoleType) -> bool:
        return role in [
            models.RoleType.ADMIN, 
            models.RoleType.SCRUM_MASTER, 
            models.RoleType.DEVELOPER, 
            models.RoleType.TESTER
        ]

    @staticmethod
    def can_edit_all_issues(role: models.RoleType) -> bool:
        return role in [
            models.RoleType.ADMIN, 
            models.RoleType.SCRUM_MASTER
        ]
        
    @staticmethod
    def can_edit_own_issues(role: models.RoleType) -> bool:
        return role in [
            models.RoleType.DEVELOPER
        ]

