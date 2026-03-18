param(
    [int]$Port = 5173,
    [switch]$SkipSync
)

$ErrorActionPreference = "Stop"

if (-not $SkipSync) {
    Write-Host "Syncing data into web/public/data ..."
    node (Join-Path $PSScriptRoot "scripts\sync-lenny-data.mjs")
}

Write-Host "Starting Vite dev server on port $Port ..."
$portArg = "--port=$Port"
npm --prefix (Join-Path $PSScriptRoot "web") run dev -- --host=127.0.0.1 $portArg
