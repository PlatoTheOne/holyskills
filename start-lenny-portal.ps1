param(
    [int]$Port = 8848,
    [switch]$NoOpen,
    [switch]$AutoPort = $true
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python is required to run local HTTP server but was not found in PATH."
}

function Test-PortListening {
    param([int]$P)
    $hit = Get-NetTCPConnection -LocalPort $P -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    return [bool]$hit
}

while ($true) {
    if (-not (Test-PortListening -P $Port)) {
        break
    }
    if (-not $AutoPort) {
        $existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($existing) {
            $proc = Get-Process -Id $existing.OwningProcess -ErrorAction SilentlyContinue
            $procName = if ($proc) { $proc.ProcessName } else { "unknown" }
            Write-Host "Port $Port is already in use by PID $($existing.OwningProcess) ($procName)."
            Write-Host "Stop that process first, then rerun:"
            Write-Host "  .\\start-lenny-portal.cmd"
        }
        exit 2
    }
    $candidate = $Port + 1
    if ($candidate -gt 8999) {
        throw "No free port found in range 8848-8999."
    }
    Write-Host "Port $Port is in use. Switching to port $candidate."
    $Port = $candidate
}

$Url = "http://localhost:$Port/portal/index.html"

if (-not $NoOpen) {
    Start-Process $Url | Out-Null
}

Write-Host "Lenny Docs Portal is running at $Url"
Write-Host "Press Ctrl+C to stop."
python -m http.server $Port --directory $Root
