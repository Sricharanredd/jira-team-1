import sys
import os
import json

# Add project root to sys.path to allow imports
sys.path.append(os.getcwd())

from app.main import app
from fastapi.openapi.utils import get_openapi

def verify_swagger():
    print("Generating OpenAPI schema...")
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        openapi_version=app.openapi_version,
        description=app.description,
        routes=app.routes,
    )

    allowed_tags = {
        'Authentication',
        'Projects',
        'Project Issues',
        'User Stories',
        'Workflow',
        'Reports',
        'Members'
    }

    errors = []
    
    paths = openapi_schema.get('paths', {})
    for path, methods in paths.items():
        for method, details in methods.items():
            tags = details.get('tags', [])
            
            # Check 1: Must have tags
            if not tags:
                errors.append(f"Endpoint {method.upper()} {path} has NO tags (falls into default).")
                continue

            # Check 2: Tags must be in allowed list
            for tag in tags:
                if tag not in allowed_tags:
                    errors.append(f"Endpoint {method.upper()} {path} has invalid tag: '{tag}'. Allowed: {allowed_tags}")

    if errors:
        print("\n❌ SWAGGER VERIFICATION FAILED with the following errors:")
        for e in errors:
            print(f" - {e}")
        sys.exit(1)
    else:
        print("\n✅ SWAGGER VERIFICATION PASSED! All endpoints are correctly grouped.")

if __name__ == "__main__":
    verify_swagger()
