from app.database import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as connection:
        # Check if table exists just in case
        try:
            # We assume table is user_story and column is issue_type
            # We will attempt to MODIFY the column to be an ENUM with the required values
            # This works for MySQL
            sql = """
            ALTER TABLE user_story
            MODIFY COLUMN issue_type ENUM('epic', 'story', 'task', 'bug', 'subtask') NOT NULL DEFAULT 'story';
            """
            print("Executing:", sql)
            connection.execute(text(sql))
            print("Migration successful.")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
