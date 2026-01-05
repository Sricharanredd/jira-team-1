
import urllib.request
import urllib.parse
import json
import ssl

API_URL = "http://localhost:8000"

def test_login():
    login_url = f"{API_URL}/auth/login"
    
    # Payload for OAuth2 (x-www-form-urlencoded)
    data = urllib.parse.urlencode({
        "username": "admin@admin.com",
        "password": "admin@123"
    }).encode('utf-8')
    
    req = urllib.request.Request(login_url, data=data, method='POST')
    # req.add_header('Content-Type', 'application/x-www-form-urlencoded') # urllib does this by default for encoded data
    
    try:
        # Ignore SSL errors for localhost if any
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(req, context=ctx) as response:
            if response.status == 200:
                body = response.read().decode('utf-8')
                json_body = json.loads(body)
                print("Login Successful!")
                print(f"Token: {json_body.get('access_token')[:20]}...")
            else:
                print(f"Login Failed: {response.status}")
                
    except urllib.request.HTTPError as e:
        print(f"Login Failed with HTTP Error: {e.code}")
        print(e.read().decode('utf-8'))
    except urllib.error.URLError as e:
        print(f"Connection Error: {e.reason}")

if __name__ == "__main__":
    test_login()
