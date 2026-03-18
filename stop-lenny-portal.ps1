param(
    [string]$RootPath = $PSScriptRoot
)

$ErrorActionPreference = "Stop"
$escaped = [Regex]::Escape($RootPath)

$targets = Get-CimInstance Win32_Process |
    Where-Object {
        $_.Name -eq "python.exe" -and
        $_.CommandLine -match "http\.server" -and
        $_.CommandLine -match $escaped
    }

if (-not $targets) {
    Write-Host "No running Lenny portal server found."
    exit 0
}

foreach ($p in $targets) {
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped PID $($p.ProcessId)"
}

Write-Host "All matching Lenny portal servers stopped."
