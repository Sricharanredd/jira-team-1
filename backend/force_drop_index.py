from app.database import engine
from sqlalchemy import text
import traceback

def force_drop():
    conn = engine.connect()
    try:
        print("Checking if index exists...")
        # Check if it exists first to avoid error
        check_sql = text("SHOW INDEX FROM user_story WHERE Key_name = 'unique_project_title'")
        result = conn.execute(check_sql).fetchall()
        
        if not result:
            print("Index 'unique_project_title' DOES NOT exist. (Already dropped?)")
        else:
            print(f"Index found: {result}")
            print("Dropping index...")
            drop_sql = text("DROP INDEX unique_project_title ON user_story")
            conn.execute(drop_sql)
            conn.commit() # Important for some drivers
            print("Index DROPPED successfully.")
            
    except Exception:
        print("An error occurred:")
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    force_drop()
