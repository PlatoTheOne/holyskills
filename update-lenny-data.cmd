@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-lenny-data.ps1" %*
