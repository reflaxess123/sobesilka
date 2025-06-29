@echo off
setlocal enabledelayedexpansion

echo Starting Sobesilka in dev mode...

:: Setup cleanup on exit
set "cleanup_on_exit=true"

:: Start FastAPI backend
echo Starting FastAPI backend...
cd /d "%~dp0\back"
start "FastAPI Backend" cmd /k "poetry run python main.py"
if errorlevel 1 (
    echo Failed to start FastAPI backend
    exit /b 1
)
echo FastAPI backend started

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

:: Start React frontend
echo Starting React frontend...
cd /d "%~dp0\front"
start "React Frontend" cmd /k "npm run dev"
if errorlevel 1 (
    echo Failed to start React frontend
    echo Stopping backend...
    taskkill /f /fi "WindowTitle eq FastAPI Backend*" > nul 2>&1
    exit /b 1
)
echo React frontend started

echo.
echo Both services started successfully!
echo - FastAPI backend: http://localhost:8000
echo - React frontend: http://localhost:3000
echo.
echo Press any key to stop all services...
pause > nul

echo Stopping services...
taskkill /f /fi "WindowTitle eq FastAPI Backend*" > nul 2>&1
taskkill /f /fi "WindowTitle eq React Frontend*" > nul 2>&1
echo Development environment stopped.
