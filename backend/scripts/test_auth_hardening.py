import requests
import sys

BASE_URL = "http://localhost:8000"

def test_register(name, email, password, confirm_password, expected_status, test_name):
    payload = {
        "name": name,
        "email": email,
        "password": password,
        "confirm_password": confirm_password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        
        if response.status_code == expected_status:
            print(f"✅ {test_name}: Passed (Status: {response.status_code})")
            return True
        else:
            print(f"❌ {test_name}: Failed (Expected {expected_status}, Got {response.status_code})")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ {test_name}: Error - {str(e)}")
        return False

def run_tests():
    print("Running Auth Hardening Tests...\n")
    
    # 1. Mismatch
    test_register(
        "Mismatch User", "mismatch@test.com", "StrongPass1!", "WrongPass1!", 
        400, "Password Mismatch Check"
    )

    # 2. Weak Password (Short)
    test_register(
        "Short User", "short@test.com", "Short1!", "Short1!", 
        400, "Length Check"
    )
    
    # 3. Weak Password (No Upper)
    test_register(
        "NoUpper User", "noupper@test.com", "lower123!", "lower123!", 
        400, "Uppercase Check"
    )
    
    # 4. Success
    # Use a unique email slightly to avoid "already registered" if re-running
    import time
    timestamp = int(time.time())
    test_register(
        "Success User", f"success_{timestamp}@test.com", "StrongPass1!", "StrongPass1!", 
        200, "Valid Registration Check"
    )

if __name__ == "__main__":
    run_tests()
