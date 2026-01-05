
import os

log_file = r"c:\Users\RAMYA SRI\OneDrive\Desktop\FINAL JIRA\jira-team-1\backend\startup_log.txt"

if os.path.exists(log_file):
    size = os.path.getsize(log_file)
    with open(log_file, 'rb') as f:
        # Read last 2000 bytes
        if size > 2000:
            f.seek(size - 2000)
        content = f.read()
        print(content.decode('utf-8', errors='ignore'))
else:
    print("Log file not found.")
