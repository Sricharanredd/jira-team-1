import sys
import os

# Ensure app is in path
sys.path.append(os.getcwd())

from sqlalchemy import text
from app.database import engine

def migrate():
    print("Starting Auth Migration...")
    with engine.connect() as conn:
        # Check for password_hash
        try:
            conn.execute(text("SELECT password_hash FROM users LIMIT 1"))
            print("Column 'password_hash' already exists.")
        except Exception as e:
            print("Adding 'password_hash' column...")
            # Using a placeholder hash that won't work for login but satisfies NOT NULL
            conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.6qV.mX3A.1'"))
            # remove default just in case for future inserts? leave it.
            
        # Check for is_active
        try:
            conn.execute(text("SELECT is_active FROM users LIMIT 1"))
            print("Column 'is_active' already exists.")
        except Exception as e:
            print("Adding 'is_active' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
            
        conn.commit()
        print("Migration finished successfully.")

if __name__ == "__main__":
    migrate()
