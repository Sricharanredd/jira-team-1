from sqlalchemy import create_engine, text
from urllib.parse import quote_plus
import sys

# Hardcoded config
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "ramyasri131518"
DB_NAME = "user_story_db"

def inspect_schema():
    encoded_password = quote_plus(DB_PASSWORD)
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}"
    
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            print(f"Connected to {DB_NAME}")
            # Get column details for 'role' in 'project_members'
            query = text("SHOW COLUMNS FROM project_members LIKE 'role'")
            result = connection.execute(query)
            row = result.fetchone()
            
            if row:
                print(f"Column: {row[0]}")
                print(f"Type: {row[1]}") 
                print(f"Null: {row[2]}")
                print(f"Default: {row[4]}")
            else:
                print("Column 'role' not found in 'project_members'")
                
            # Also show all values in enum if it's an enum
             
    except Exception as e:
        print(f"Error inspecting schema: {e}")

if __name__ == "__main__":
    inspect_schema()
