@echo off
cd /d "%~dp0"
echo Starting AIVA Backend...
call backend\.venv\Scripts\activate.bat
python backend\start_backend.py
pause
