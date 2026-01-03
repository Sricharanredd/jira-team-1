from fastapi import FastAPI, Depends, Form, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import shutil

from app.database import engine, get_db
from app.modules.user_story import crud as story_crud, models as story_models, schemas as story_schemas
from app.modules.project import crud as project_crud, models as project_models, schemas as project_schemas
from app.modules.workflow import crud as workflow_crud, models as workflow_models
from app.modules.auth import models as auth_models, crud as auth_crud, dependencies as auth_deps, router as auth_router

# Create tables
project_models.Base.metadata.create_all(bind=engine)
story_models.Base.metadata.create_all(bind=engine)
workflow_models.Base.metadata.create_all(bind=engine)
auth_models.Base.metadata.create_all(bind=engine)

# Seed Workflow & Mock Auth Data
# Seed Workflow
with Session(engine) as db:
    workflow_crud.seed_workflow_transitions(db)
    
    # Bootstrap Super Admin (SriCharan)
    super_admin_email = "sricharanreddyk33@gmail.com"
    super_admin = auth_crud.get_user_by_email(db, super_admin_email)
    
    from app.modules.auth.security import get_password_hash
    
    if not super_admin:
        print(f"Bootstrapping Super Admin: {super_admin_email}")
        user_data = auth_models.User(
            name="SriCharan",
            email=super_admin_email,
            password_hash=get_password_hash("Charan@33"),
            is_active=True,
            global_role=auth_models.GlobalRole.ADMIN
        )
        db.add(user_data)
        db.commit()
    elif super_admin.global_role != auth_models.GlobalRole.ADMIN:
        print(f"Promoting {super_admin_email} to Super Admin")
        super_admin.global_role = auth_models.GlobalRole.ADMIN
        db.commit()

app = FastAPI(
    title="User Story API",
    desc="API to manage User Stories",
    version="2.0",
)

app.include_router(auth_router.router)

# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = error['loc'][-1]
        msg = error['msg']
        
        # Custom messages based on error type
        if error['type'] == 'type_error.integer':
            msg = f"{field} must be an integer"
        elif error['type'] == 'value_error.missing':
            msg = f"{field} is required"
        elif error['type'] in ('type_error.enum', 'enum'):
            # For Status Enum
            if field == 'status':
                 msg = "Invalid status value. Allowed values: todo, in_progress, testing, done"
            else:
                 msg = f"Invalid {field} value"
        
        errors.append(msg)
        
    return JSONResponse(
        status_code=422,
        content={"detail": errors[0] if len(errors) == 1 else errors},
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# upload base directory
UPLOAD_BASE_DIR = "uploads/user_stories"
os.makedirs(UPLOAD_BASE_DIR, exist_ok=True)


@app.get("/", include_in_schema=False)
def root():
    return {"message": "User Story API is running (V2)"}


# -------------------- PROJECT ROUTER --------------------
from app.modules.project import router as project_router
from app.modules.user_story import router as story_router
from app.modules.reports import router as reports_router
from app.modules.settings import router as settings_router
from app.modules.settings import models as settings_models

settings_models.Base.metadata.create_all(bind=engine)

app.include_router(auth_router.router)
app.include_router(project_router.router)
app.include_router(story_router.router)
app.include_router(reports_router.router)
app.include_router(settings_router.router)

# -------------------- REPORT ENDPOINTS --------------------

# -------------------- REPORT ENDPOINTS --------------------
from sqlalchemy import func

@app.get("/reports/summary", tags=["Reports"])
def get_reports_summary(db: Session = Depends(get_db)):
    total_projects = db.query(project_models.Project).count()
    total_issues = db.query(story_models.UserStory).count()
    return {
        "total_projects": total_projects,
        "total_issues": total_issues
    }

@app.get("/reports/issues-by-status", tags=["Reports"])
def get_issues_by_status(db: Session = Depends(get_db)):
    # Group by status
    results = db.query(
        story_models.UserStory.status, 
        func.count(story_models.UserStory.id)
    ).group_by(story_models.UserStory.status).all()
    
    return [
        {"status": row[0], "count": row[1]}
        for row in results
    ]

@app.get("/reports/issues-by-type", tags=["Reports"])
def get_issues_by_type(db: Session = Depends(get_db)):
    # Group by issue_type
    results = db.query(
        story_models.UserStory.issue_type, 
        func.count(story_models.UserStory.id)
    ).group_by(story_models.UserStory.issue_type).all()
    
    return [
        {"type": row[0], "count": row[1]}
        for row in results
    ]

# -------------------- PROJECT REPORT ENDPOINTS --------------------

@app.get("/projects/{project_id}/reports/summary", tags=["Reports"])
def get_project_reports_summary(project_id: int, db: Session = Depends(get_db)):
    # Verify Project Exists
    project = project_crud.get_project_by_id(db, project_id)
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")

    base_query = db.query(story_models.UserStory).filter(story_models.UserStory.project_id == project_id)
    
    total_issues = base_query.count()
    done = base_query.filter(story_models.UserStory.status == 'done').count()
    in_progress = base_query.filter(story_models.UserStory.status == 'in_progress').count()
    backlog = base_query.filter(story_models.UserStory.status == 'backlog').count()
    
    return {
        "total_issues": total_issues,
        "done": done,
        "in_progress": in_progress,
        "backlog": backlog
    }

@app.get("/projects/{project_id}/reports/issues-by-status", tags=["Reports"])
def get_project_issues_by_status(project_id: int, db: Session = Depends(get_db)):
    # Verify Project
    if not project_crud.get_project_by_id(db, project_id):
         raise HTTPException(status_code=404, detail="Project not found")

    results = db.query(
        story_models.UserStory.status, 
        func.count(story_models.UserStory.id)
    ).filter(story_models.UserStory.project_id == project_id)\
     .group_by(story_models.UserStory.status).all()
    
    return [
        {"status": row[0], "count": row[1]}
        for row in results
    ]

@app.get("/projects/{project_id}/reports/issues-by-type", tags=["Reports"])
def get_project_issues_by_type(project_id: int, db: Session = Depends(get_db)):
    # Verify Project
    if not project_crud.get_project_by_id(db, project_id):
         raise HTTPException(status_code=404, detail="Project not found")

    results = db.query(
        story_models.UserStory.issue_type, 
        func.count(story_models.UserStory.id)
    ).filter(story_models.UserStory.project_id == project_id)\
     .group_by(story_models.UserStory.issue_type).all()
    
    return [
        {"type": row[0], "count": row[1]}
        for row in results
    ]


# -------------------- USER STORY ENDPOINTS --------------------




