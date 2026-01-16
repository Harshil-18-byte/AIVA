import uvicorn
import os
import sys

# Get the directory containing this script (C:\AI-video-editor\backend)
current_dir = os.path.dirname(os.path.abspath(__file__))
# Get the project root (C:\AI-video-editor)
project_root = os.path.dirname(current_dir)

# Add project root to Python path so 'import backend.api' works
sys.path.append(project_root)

if __name__ == "__main__":
    print(f"Starting AIVA Backend from: {project_root}")
    # We must run this from the perspective of the root package
    # Change working directory to root to match imports
    os.chdir(project_root)
    uvicorn.run("backend.api:app", host="127.0.0.1", port=8000, reload=True)
