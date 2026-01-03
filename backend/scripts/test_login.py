import requests

BASE_URL = "http://127.0.0.1:8000"

def test_login():
    email = "admin_test_flow@test.com"
    password = "password123"
    
    print(f"Attempting login for {email}...")
    r = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")

if __name__ == "__main__":
    test_login()
