from sqlalchemy import Column, Integer, String, Boolean, UniqueConstraint
from app.database import Base

class WorkflowTransition(Base):
    __tablename__ = "workflow_transitions"

    id = Column(Integer, primary_key=True, index=True)
    from_status = Column(String(50), nullable=False)
    to_status = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)

    __table_args__ = (
        UniqueConstraint('from_status', 'to_status', name='unique_transition'),
    )
