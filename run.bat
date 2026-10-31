@echo off
title KnowBridge - Continuous Shared Memory Platform
echo ========================================================
echo   Starting KnowBridge Platform...
echo ========================================================
cd /d "%~dp0frontend"
echo Starting Vite dev server at http://localhost:5173...
start http://localhost:5173
call npm.cmd run dev
pause
