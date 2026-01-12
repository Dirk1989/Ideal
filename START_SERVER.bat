@echo off
REM IdealCar Quick Start Script for Windows
REM This script starts the backend server

echo.
echo ============================================
echo    IdealCar Backend - Quick Start
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/3] Node.js version:
node --version
echo.

REM Navigate to backend directory
cd /d "%~dp0backend"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend directory not found!
    pause
    exit /b 1
)

echo [2/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
) else (
    echo Dependencies already installed!
)
echo.

echo [3/3] Starting server...
echo.
echo Server will start on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
echo ============================================
echo.

REM Start the server
call npm start

pause
