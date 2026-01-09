import uvicorn
import os
import sys

# Add the project root to the python path explicitly
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

if __name__ == "__main__":
    print(f"Starting Antigravity Backend from: {current_dir}")
    # Run Uvicorn pointing to the backend module
    uvicorn.run("backend.api:app", host="127.0.0.1", port=8000, reload=True)
