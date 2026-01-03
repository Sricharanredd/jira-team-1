
import requests

BASE_URL = "http://127.0.0.1:8000"

try:
    resp = requests.get(f"{BASE_URL}/debug/stories")
    print(resp.json())
except Exception as e:
    print(e)
