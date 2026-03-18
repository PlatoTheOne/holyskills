param(
    [string]$BasePath = "/lenny-data-portal/"
)

$ErrorActionPreference = "Stop"

node (Join-Path $PSScriptRoot "scripts\sync-lenny-data.mjs") --mode public
$env:VITE_BASE_PATH = $BasePath
$env:VITE_CONTENT_MODE = "public"
npm --prefix (Join-Path $PSScriptRoot "web") run build
Remove-Item Env:VITE_BASE_PATH -ErrorAction SilentlyContinue
Remove-Item Env:VITE_CONTENT_MODE -ErrorAction SilentlyContinue

Write-Host "Build completed: web/dist"
