@echo off
setlocal enabledelayedexpansion

echo Starting API generation process...

:: Start FastAPI backend
echo Starting FastAPI backend...
cd /d "%~dp0\back"
start /b "" poetry run python main.py > nul 2>&1
if errorlevel 1 (
    echo Failed to start FastAPI backend
    exit /b 1
)

:: Wait for API to be ready (simple approach)
echo Waiting for FastAPI to be ready...
timeout /t 5 /nobreak > nul

:: Check if API is responding
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8000/openapi.json' -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if errorlevel 1 (
    echo Server did not start properly
    taskkill /f /im python.exe > nul 2>&1
    exit /b 1
)

echo FastAPI is ready!

:: Generate API client using orval
echo Generating API client code...
cd /d "%~dp0\front"
npm run api:generate
if errorlevel 1 (
    echo API client generation failed
    taskkill /f /im python.exe > nul 2>&1
    exit /b 1
)

echo API client generation completed successfully!

:: Stop the backend process
echo Stopping FastAPI backend...
taskkill /f /im python.exe > nul 2>&1
echo FastAPI backend stopped.

echo API generation process completed successfully!
