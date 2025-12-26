# AIVA v1

AIVA is a system-wide AI assistant for video editing that works on top of
any software — similar to Grammarly for writing.

## Features
- Always-on-top overlay
- Wake word: "Hey AIVA"
- Offline Whisper voice recognition
- Gesture-based navigation
- Explainable AI suggestions
- No forced editor replacement

## Run Backend
```bash
pip install -r backend/requirements.txt
uvicorn backend.api:app --reload
