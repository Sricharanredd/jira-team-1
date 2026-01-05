
import sys
import os
from sqlalchemy import inspect, create_engine

# Make sure we can import 'app'
sys.path.append(os.getcwd())

try:
    from app.config import DB_USER, DB_PASSWORD, DB_HOST, DB_NAME
    from app.database import Base
    
    SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        print("Table 'users' does not exist.")
    else:
        columns = inspector.get_columns("users")
        print("Columns in 'users' table:")
        for column in columns:
            print(f"- {column['name']} ({column['type']})")
            
except ImportError as e:
    print(f"Import Error: {e}")
    # Fallback to direct connection string if config fails
    # But usually app.config should work if path is right
except Exception as e:
    print(f"Error: {e}")
