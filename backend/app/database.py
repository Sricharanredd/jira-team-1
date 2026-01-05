from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus
from sqlalchemy.orm import Session
from app.config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

# Encode password to handle special characters in MySQL connection string
encoded_password = quote_plus(DB_PASSWORD)

# Create database connection URL for MySQL using pymysql driver
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}"

# Create SQLAlchemy engine with echo=True for debugging SQL queries
engine = create_engine(DATABASE_URL, echo=True)

# Session factory for database operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()


# Dependency function to provide database session to API endpoints
# Automatically closes session after request completes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
