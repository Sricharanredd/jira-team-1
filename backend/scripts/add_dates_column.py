import sys
import os
from sqlalchemy import create_engine, text

# Add backend to path so we can import app.database if needed, though we just need the URL string usually
# Or we can just import the URL from app.database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import DATABASE_URL

def add_columns():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("--- Adding start_date and end_date columns ---")
        try:
            conn.execute(text("ALTER TABLE user_story ADD COLUMN start_date DATETIME"))
            print("Added start_date column.")
        except Exception as e:
            print(f"Failed to add start_date (might exist): {e}")

        try:
            conn.execute(text("ALTER TABLE user_story ADD COLUMN end_date DATETIME"))
            print("Added end_date column.")
        except Exception as e:
            print(f"Failed to add end_date (might exist): {e}")
        
        conn.commit()
        print("--- Migration Complete ---")

if __name__ == "__main__":
    add_columns()
