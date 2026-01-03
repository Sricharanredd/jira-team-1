from sqlalchemy.orm import Session
from app.modules.project import models, schemas

def create_project(db: Session, project: schemas.ProjectCreate):
    # Check if project name exists
    if db.query(models.Project).filter(models.Project.project_name == project.project_name).first():
        raise ValueError("Project name already exists")

    # Check if project prefix exists
    if db.query(models.Project).filter(models.Project.project_prefix == project.project_prefix).first():
        raise ValueError("Project prefix already exists")

    db_project = models.Project(
        project_name=project.project_name,
        project_prefix=project.project_prefix,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_project_by_id(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def get_all_projects(db: Session):
    return db.query(models.Project).all()
