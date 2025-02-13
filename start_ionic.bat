@echo off
set PYTHONPATH=%CD%

REM Activate virtual environment
call venv\Scripts\activate

REM Run the Python app in the background
start /B python app-ionic.py > app-ionic.log 2>&1

REM Wait for the server to start
timeout /t 5 /nobreak >nul

REM Open the web app in the default browser
start http://127.0.0.1:5000