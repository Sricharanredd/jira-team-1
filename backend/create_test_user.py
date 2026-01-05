from app.database import SessionLocal
from app.modules.auth import crud, schemas
from app.modules.auth.models import RoleType, GlobalRole, PreferredRole

def create_test_user():
    db = SessionLocal()
    
    email = "debug_user@example.com"
    password = "debugpassword123"
    
    user = crud.get_user_by_email(db, email=email)
    if not user:
        print(f"Creating user {email}...")
        user_data = schemas.UserCreate(
            email=email,
            name="Debug User",
            password=password,
            role=PreferredRole.DEVELOPER # preferred_role uses PreferredRole enum
        )
        user = crud.create_user(db, user_data, GlobalRole.ADMIN) 
        # Note: crud.create_user signature: (db, user, global_role) based on my reading of crud.py earlier
        # Wait, let me check crud.py signature again.
        
        # user.global_role = GlobalRole.ADMIN # crud.create_user sets it from arg
        # db.commit() -- crud.create_user commits.
        print("User created.")
    else:
        print(f"User {email} already exists.")
            
    db.close()

if __name__ == "__main__":
    create_test_user()
