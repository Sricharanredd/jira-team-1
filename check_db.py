
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app import database
from backend.app.modules.user_story import models

# Setup DB
db = database.SessionLocal()

try:
    project_id = 1
    print(f"--- Checking User Stories for Project {project_id} ---")
    stories = db.query(models.UserStory).filter(models.UserStory.project_id == project_id).all()
    print(f"Total Stories Found: {len(stories)}")
    for s in stories:
        print(f"ID: {s.id}, Code: {s.story_code}, Title: {s.title}")
        
    print("-" * 20)
    
    # Simulate the buggy logic
    count = len(stories)
    project_prefix = "goo" # derived from project name
    next_num = count + 1
    generated_code = f"{project_prefix}-{next_num:04d}"
    print(f"Logic 'count + 1' generates: {generated_code}")
    
    has_conflict = any(s.story_code == generated_code for s in stories)
    print(f"Does this conflict? {has_conflict}")

finally:
    db.close()
