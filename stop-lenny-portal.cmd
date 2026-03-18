@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-lenny-portal.ps1" %*
