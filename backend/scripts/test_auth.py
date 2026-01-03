import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_auth_flow():
    # 1. Register
    reg_payload = {
        "name": "Test Admin",
        "email": "admin_test_flow@test.com",
        "password": "password123"
    }
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
        print(f"Register Status: {r.status_code}")
        print(f"Register Resp: {r.text}")
        
        if r.status_code == 200:
            token = r.json()['access_token']
            print("Register Success, Token obtained.")
        elif r.status_code == 400:
             print(f"400 Error: {r.text}")
             if "already registered" in r.text:
                 print("User exists, logging in...")
                 r = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin_test_flow@test.com", "password": "password123"})
                 print(f"Login Status: {r.status_code}")
                 print(f"Login Resp: {r.text}")
                 if r.status_code == 200:
                    token = r.json()['access_token']
                 else:
                    return
             else:
                 return

        # 2. Check /auth/me
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Me Status: {r.status_code}")
        print(f"Me Resp: {r.json()}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_auth_flow()
