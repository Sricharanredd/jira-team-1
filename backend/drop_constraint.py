from app.database import engine
from sqlalchemy import text

def drop_constraint():
    try:
        with engine.connect() as connection:
            # MySQL syntax to drop index (which is what UniqueConstraint creates)
            # We use ignore error logic or just try/except because it might not exist if run twice
            print("Attempting to drop index 'unique_project_title' from 'user_story' table...")
            
            # Note: For valid SQLAlchemy operations we should use text()
            # MySQL command: DROP INDEX index_name ON table_name
            
            sql = text("DROP INDEX unique_project_title ON user_story")
            connection.execute(sql)
            print("Successfully dropped index 'unique_project_title'.")
            
    except Exception as e:
        print(f"Error (might be already dropped): {e}")

if __name__ == "__main__":
    drop_constraint()
