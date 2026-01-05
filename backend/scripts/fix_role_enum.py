from sqlalchemy import create_engine, text
from urllib.parse import quote_plus
import sys

# Hardcoded config
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "ramyasri131518"
DB_NAME = "user_story_db"

def fix_schema():
    encoded_password = quote_plus(DB_PASSWORD)
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}"
    
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            print(f"Connected to {DB_NAME}")
            
            # 1. Update old 'MEMBER' values to 'DEVELOPER' to avoid data loss
            print("Updating deprecated 'MEMBER' roles to 'DEVELOPER'...")
            connection.execute(text("UPDATE project_members SET role='DEVELOPER' WHERE role='MEMBER'"))
            connection.commit()
            
            # 2. Alter Table
            print("Altering table to update ENUM...")
            # Note: We must list ALL valid values.
            new_enum_def = "'ADMIN', 'SCRUM_MASTER', 'DEVELOPER', 'TESTER', 'VIEWER'"
            query = text(f"ALTER TABLE project_members MODIFY COLUMN role ENUM({new_enum_def}) NOT NULL DEFAULT 'VIEWER'")
            connection.execute(query)
            connection.commit()
            
            print("Successfully updated ENUM definition.")
            
    except Exception as e:
        print(f"Error fixing schema: {e}")

if __name__ == "__main__":
    fix_schema()
