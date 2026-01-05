
import urllib.request
import urllib.parse
import json
import ssl

API_URL = "http://localhost:8000"

def get_token():
    # Login to get token
    login_url = f"{API_URL}/auth/login"
    data = urllib.parse.urlencode({
        "username": "admin@admin.com", 
        "password": "admin@123"
    }).encode('utf-8')
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(login_url, data=data, method='POST')
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            if response.status == 200:
                body = response.read().decode('utf-8')
                return json.loads(body).get('access_token')
    except Exception as e:
        print(f"Login failed: {e}")
        return None

def verify_fetch():
    token = get_token()
    if not token:
        print("Could not get token.")
        return

    # 1. Get all stories to find a valid ID
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    list_url = f"{API_URL}/user-story?project_id=1" # Assuming project 1
    req = urllib.request.Request(list_url)
    req.add_header('Authorization', f'Bearer {token}')
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            stories = json.loads(response.read().decode('utf-8'))
            print(f"Found {len(stories)} stories.")
            
            if not stories:
                print("No stories to test.")
                return

            # 2. Pick the first story and fetch details
            target_story = stories[0]
            story_id = target_story['id']
            print(f"Testing fetch for Story ID: {story_id}")
            
            detail_url = f"{API_URL}/user-story/{story_id}"
            req_detail = urllib.request.Request(detail_url)
            req_detail.add_header('Authorization', f'Bearer {token}')
            
            with urllib.request.urlopen(req_detail, context=ctx) as detail_res:
                if detail_res.status == 200:
                    data = json.loads(detail_res.read().decode('utf-8'))
                    print("Fetch Successful!")
                    print(f"Title: {data.get('title')}")
                else:
                    print(f"Fetch failed with status: {detail_res.status}")
                    
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_fetch()
