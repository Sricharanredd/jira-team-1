from pydantic import BaseModel, Field

class ProjectCreate(BaseModel):
    project_name: str = Field(..., example="Banking App")
    project_prefix: str = Field(..., example="BA")

class ProjectResponse(BaseModel):
    id: int
    project_name: str
    project_prefix: str
    increment_number: int

    class Config:
        from_attributes = True
