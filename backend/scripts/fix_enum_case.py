import sys
import os
from sqlalchemy import create_engine, text

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import DATABASE_URL as SQLALCHEMY_DATABASE_URL

def fix_enum_case():
    print("Starting Strict Enum Case Fix...")
    
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as connection:
        try:
            print("1. Converting 'role' column to VARCHAR(50) to allow free text...")
            connection.execute(text("ALTER TABLE project_members MODIFY COLUMN role VARCHAR(50)"))
            print("Column converted to VARCHAR.")

            print("2. Normalizing all values to UPPERCASE...")
            connection.execute(text("UPDATE project_members SET role = UPPER(role)"))
            connection.commit()
            print("Values normalized.")

            print("3. Converting 'role' column back to Strict ENUM...")
            # We must be careful to include ALL valid values
            connection.execute(text("ALTER TABLE project_members MODIFY COLUMN role ENUM('ADMIN', 'SCRUM_MASTER', 'DEVELOPER', 'TESTER', 'VIEWER') NOT NULL DEFAULT 'VIEWER'"))
            print("Column converted back to ENUM.")

            # 4. Verify values again
            print("Verifying values...")
            result = connection.execute(text("SELECT DISTINCT role FROM project_members"))
            roles = [row[0] for row in result.fetchall()]
            print(f"Found roles: {roles}")
            
        except Exception as e:
            print(f"Error during fix: {e}")

if __name__ == "__main__":
    fix_enum_case()
