@echo off
echo.
echo  =====================================================
echo   WebSleuth AI Backend Startup — IBM LinuxONE
echo  =====================================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo         Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)

:: Install requirements
echo [1/3] Installing dependencies...
pip install -r requirements.txt --quiet

if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

echo [2/3] Starting WebSleuth AI API server...
echo.
echo  Backend URL:  http://localhost:8000
echo  API Docs:     http://localhost:8000/docs
echo  Status:       http://localhost:8000/health
echo.
echo  Press Ctrl+C to stop the server.
echo  =====================================================
echo.

:: Start the server
python main.py
pause
