from app.database import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as connection:
        try:
            # Add parent_issue_id column with Self-Referencing Foreign Key
            sql = """
            ALTER TABLE user_story
            ADD COLUMN parent_issue_id INT NULL,
            ADD CONSTRAINT fk_parent_issue 
            FOREIGN KEY (parent_issue_id) REFERENCES user_story(id) 
            ON DELETE CASCADE;
            """
            print("Executing:", sql)
            connection.execute(text(sql))
            print("Migration successful: parent_issue_id added.")
        except Exception as e:
            print(f"Migration failed (might already exist): {e}")

if __name__ == "__main__":
    run_migration()
