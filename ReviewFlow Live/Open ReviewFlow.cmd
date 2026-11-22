@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-reviewflow.ps1"
if errorlevel 1 pause
