@echo off
title Pakka Local - 3D Scroll-Drive Web Experience
echo ====================================================
echo Starting Pakka Local 3D Web Server...
echo ====================================================

where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Found PHP CLI. Starting built-in PHP server at http://localhost:8000
    php -S localhost:8000
) else (
    echo [INFO] PHP CLI not found in PATH. Starting Node development server at http://localhost:8080
    node server.js
)
pause
