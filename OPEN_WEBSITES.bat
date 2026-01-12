@echo off
REM Open IdealCar websites in default browser

echo.
echo ============================================
echo    Opening IdealCar Websites
echo ============================================
echo.

REM Check if backend is running
echo Checking if backend is running on port 3000...
netstat -an | findstr ":3000" >nul
if %ERRORLEVEL% EQU 0 (
    echo Backend is running!
    echo.
) else (
    echo [WARNING] Backend doesn't appear to be running!
    echo Please run START_SERVER.bat first.
    echo.
    timeout /t 3
)

REM Get current directory
set "DIR=%~dp0"

echo Opening websites...
echo.
echo 1. Public Website
start "" "%DIR%public-site\index.html"
timeout /t 1

echo 2. Admin Panel Login
start "" "%DIR%admin-panel\login.html"
timeout /t 1

echo 3. System Test Page
start "" "%DIR%test.html"
echo.

echo ============================================
echo All websites opened!
echo ============================================
echo.
echo Default Admin Password: admin123
echo.

pause
