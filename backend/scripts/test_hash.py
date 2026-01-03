from passlib.context import CryptContext

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    print("Context created.")
    
    password = "password123"
    print(f"Hashing: {password}")
    hashed = pwd_context.hash(password)
    print(f"Hashed: {hashed}")
    
    print("Verifying...")
    valid = pwd_context.verify(password, hashed)
    print(f"Valid: {valid}")

except Exception as e:
    print(f"Error: {e}")
