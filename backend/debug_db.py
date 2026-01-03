from app.database import SessionLocal, engine
from app.modules.user_story import models
from sqlalchemy import text

def fix_schema():
    db = SessionLocal()
    try:
        print("Attempting to add issue_type column...")
        db.execute(text("ALTER TABLE user_story ADD COLUMN issue_type VARCHAR(20) NOT NULL DEFAULT 'story'"))
        db.commit()
        print("Schema updated successfully.")
    except Exception as e:
        if "Duplicate column" in str(e) or "1060" in str(e):
             print("Column already exists. No action needed.")
        else:
             print(f"Error updating schema: {e}")
    finally:
        db.close()

def check_stories():
    db = SessionLocal()
    try:
        print("Checking stories...")
        stories = db.query(models.UserStory).all()
        print(f"Found {len(stories)} stories.")
        for s in stories:
            print(f"- {s.id}: {s.title} [{s.status}] ({s.issue_type})")
    except Exception as e:
        print(f"Error querying stories: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_schema()
    check_stories()
