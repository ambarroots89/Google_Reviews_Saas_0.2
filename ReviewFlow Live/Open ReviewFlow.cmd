@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0backend\start-reviewflow.ps1"
if errorlevel 1 pause
