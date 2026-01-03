import sys
import os
from sqlalchemy import create_engine, text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import DATABASE_URL

def debug_enum():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Raw Enum Values:")
        # Select both the string value and the numeric index (role+0)
        # Note: CAST(role AS CHAR) ensures we see the string MySQL is returning
        result = conn.execute(text("SELECT id, CAST(role AS CHAR), role+0 FROM project_members"))
        for row in result:
            print(f"ID: {row[0]}, Role(Str): '{row[1]}', Role(Idx): {row[2]}")

if __name__ == "__main__":
    debug_enum()
