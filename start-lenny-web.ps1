param(
    [int]$Port = 5173,
    [switch]$SkipSync,
    [string]$DocApi = ""
)

$ErrorActionPreference = "Stop"

if (-not $SkipSync) {
    Write-Host "Syncing private data into web/public/data ..."
    node (Join-Path $PSScriptRoot "scripts\sync-lenny-data.mjs") --mode private
}

Write-Host "Starting Vite dev server on port $Port ..."
$portArg = "--port=$Port"
$env:VITE_CONTENT_MODE = "private"
if (-not [string]::IsNullOrWhiteSpace($DocApi)) {
    $env:VITE_DOC_CONTENT_API = $DocApi
    Write-Host "Using private content API: $DocApi"
}
npm --prefix (Join-Path $PSScriptRoot "web") run dev -- --host=127.0.0.1 $portArg
