import requests

BASE_URL = "http://127.0.0.1:8000"

def test_new_reg():
    reg_payload = {
        "name": "New Admin 7",
        "email": "admin_new_7@test.com",
        "password": "password123"
    }
    r = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    print(f"Register Status: {r.status_code}")
    print(f"Register Resp: {r.text}")

if __name__ == "__main__":
    test_new_reg()
