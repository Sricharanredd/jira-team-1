from passlib.context import CryptContext
import sys

print(f"Python: {sys.version}")
try:
    import bcrypt
    print(f"Bcrypt: {bcrypt.__version__}")
except ImportError:
    print("Bcrypt not installed")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def test(p):
    print(f"Testing '{p}' (len={len(p)})")
    try:
        h = pwd_context.hash(p)
        print(f"Hash: {h[:20]}...")
    except Exception as e:
        print(f"ERROR: {e}")

test("password123")
test("a"*72)
test("a"*73)
