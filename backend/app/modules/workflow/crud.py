from sqlalchemy.orm import Session
from app.modules.workflow import models

DEFAULT_TRANSITIONS = [
    ("backlog", "todo"),
    ("todo", "in_progress"),
    ("in_progress", "testing"),
    ("testing", "done"),
    # Also allowed: reverse? No, restricted by requirements? 
    # "Status update flow... validate transition exists"
    # User requirement only listed forward transitions in Seed.
    # But usually move back is allowed. Requirements say "Seed initial transitions: ...".
    # Phase 0 says "Snap card back" if rejected.
    # I will stick STRICTLY to the requirements: "Seed initial transitions: BACKLOG->TODO, TODO->IN_PROGRESS, IN_PROGRESS->TESTING, TESTING->DONE".
    # User said "Status-based Kanban board... Drag & drop updates status".
    # If I only allow forward, drag back will fail.
    # But requirements say "workflow is backend-enforced".
    # I will implicitly allow reverse or SHOULD I? 
    # "Seed initial transitions: ..." list matches the forward flow.
    # "Invalid drop: Card snaps back".
    # So I will ONLY seed the requested ones. If user wants reverse, they haven't asked for it yet.
    # Wait, Phase 4 says "BACKLOG cannot jump directly to IN_PROGRESS".
    # I will stick to the explicitly requested seed.
]

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
