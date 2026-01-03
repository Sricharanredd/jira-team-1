from sqlalchemy.orm import Session
from app.modules.workflow import models

statuses = ["backlog", "todo", "in_progress", "testing", "done"]
DEFAULT_TRANSITIONS = []
for s1 in statuses:
    for s2 in statuses:
        if s1 != s2:
            DEFAULT_TRANSITIONS.append((s1, s2))

def seed_workflow_transitions(db: Session):
    for from_s, to_s in DEFAULT_TRANSITIONS:
        exists = db.query(models.WorkflowTransition).filter(
            models.WorkflowTransition.from_status == from_s,
            models.WorkflowTransition.to_status == to_s
        ).first()
        if not exists:
            db.add(models.WorkflowTransition(from_status=from_s, to_status=to_s))
    db.commit()

def is_transition_valid(db: Session, from_status: str, to_status: str) -> bool:
    # If status is not changing, it's valid (or handled by other logic)
    if from_status == to_status:
        return True # Handled elsewhere, but technically not a transition
        
    transition = db.query(models.WorkflowTransition).filter(
        models.WorkflowTransition.from_status == from_status,
        models.WorkflowTransition.to_status == to_status,
        models.WorkflowTransition.is_active == True
    ).first()
    
    return transition is not None
