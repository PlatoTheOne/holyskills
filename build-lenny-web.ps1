param(
    [string]$BasePath = "/lenny-data-portal/"
)

$ErrorActionPreference = "Stop"

node (Join-Path $PSScriptRoot "scripts\sync-lenny-data.mjs")
$env:VITE_BASE_PATH = $BasePath
npm --prefix (Join-Path $PSScriptRoot "web") run build
Remove-Item Env:VITE_BASE_PATH -ErrorAction SilentlyContinue

Write-Host "Build completed: web/dist"
