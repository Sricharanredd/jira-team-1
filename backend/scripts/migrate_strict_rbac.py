import sys
import os
from sqlalchemy import create_engine, text

# Add the parent directory to sys.path to import app modules if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import DATABASE_URL as SQLALCHEMY_DATABASE_URL

def migrate():
    print("Starting Strict RBAC Migration...")
    
    # Connect to DB
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as connection:
        # Add preferred_role column to users table if it doesn't exist
        print("Checking/Adding preferred_role to users table...")
        try:
            # Check if column exists
            result = connection.execute(text("SHOW COLUMNS FROM users LIKE 'preferred_role'"))
            if not result.fetchone():
                print("Adding preferred_role column...")
                connection.execute(text("ALTER TABLE users ADD COLUMN preferred_role ENUM('DEVELOPER', 'TESTER', 'VIEWER') DEFAULT 'VIEWER'"))
                print("preferred_role column added.")
            else:
                print("preferred_role column already exists.")
        except Exception as e:
            print(f"Error adding preferred_role: {e}")

        print("Migration completed.")

if __name__ == "__main__":
    migrate()
