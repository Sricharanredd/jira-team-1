import sys
import os
from sqlalchemy import create_engine, text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import DATABASE_URL

def migrate_user_story_owner():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        try:
            print("Adding 'created_by' column to user_story table...")
            conn.execute(text("ALTER TABLE user_story ADD COLUMN created_by INT NULL"))
            conn.execute(text("ALTER TABLE user_story ADD CONSTRAINT fk_user_story_created_by FOREIGN KEY (created_by) REFERENCES users(id)"))
            conn.commit()
            print("Column added successfully.")
        except Exception as e:
            print(f"Migration failed (might already exist): {e}")

if __name__ == "__main__":
    migrate_user_story_owner()
