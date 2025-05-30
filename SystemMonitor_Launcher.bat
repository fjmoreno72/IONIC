@echo off
REM Launcher script for System Monitor
REM This sets the required environment variables and runs the executable

REM Set default environment variables
set IONIC2_PORT=5007
set IONIC2_DEBUG=False
set IONIC2_HOST=0.0.0.0

REM You can override these by setting them before running this script
REM For example: set IONIC2_PORT=8080 && SystemMonitor_Launcher.bat

echo Starting System Monitor on port %IONIC2_PORT%...
echo.
echo To change the port, set IONIC2_PORT before running this script:
echo   set IONIC2_PORT=8080 ^&^& SystemMonitor_Launcher.bat
echo.

REM Run the executable
SystemMonitor.exe

REM Keep window open if there's an error
if %ERRORLEVEL% neq 0 (
    echo.
    echo System Monitor exited with error code %ERRORLEVEL%
    pause
)
