
import sys
import os

from app import database
from app.modules.user_story import models

# Setup DB
db = database.SessionLocal()

try:
    project_id = 1
    print(f"--- Checking User Stories for Project {project_id} ---")
    stories = db.query(models.UserStory).filter(models.UserStory.project_id == project_id).all()
    print(f"Total Stories Found: {len(stories)}")
    for s in stories:
        print(f"ID: {s.id}, Code: {s.story_code}, Title: {s.title}")
        
finally:
    db.close()
