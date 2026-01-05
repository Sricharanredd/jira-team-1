from app.database import engine
from sqlalchemy import text

def show_indexes():
    try:
        with engine.connect() as connection:
            print("Fetching indexes for 'user_story' table...")
            # MySQL syntax
            sql = text("SHOW INDEX FROM user_story")
            result = connection.execute(sql)
            for row in result:
                print(f"Key_name: {row.Key_name}, Column_name: {row.Column_name}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    show_indexes()
