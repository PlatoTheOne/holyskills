param(
    [string]$RepoPath = (Join-Path $PSScriptRoot "lennys-newsletterpodcastdata-all"),
    [switch]$UseClipboardCommandOnly
)

$ErrorActionPreference = "Stop"

function Invoke-GitPull {
    param(
        [string]$Path
    )

    & git -C $Path pull --ff-only
    return $LASTEXITCODE
}

function Get-ClipboardPullCommand {
    if (-not (Get-Command Get-Clipboard -ErrorAction SilentlyContinue)) {
        return $null
    }

    $clipboard = (Get-Clipboard -Raw).Trim()
    if ([string]::IsNullOrWhiteSpace($clipboard)) {
        return $null
    }

    $normalized = ($clipboard -replace "[\r\n]+", " ").Trim()
    if ($normalized -notmatch "(?is)git\s+-c\s+http\.https://github\.com/\.extraheader=.*?pull(\s|$)") {
        return $null
    }

    return $normalized
}

function Invoke-ClipboardPull {
    param(
        [string]$Path
    )

    $normalized = Get-ClipboardPullCommand
    if (-not $normalized) {
        Write-Host "Clipboard does not look like Lenny's temporary pull command."
        Write-Host "Copy command from lennysdata.com -> 'Copy command to pull updates' and rerun this script."
        return 4
    }

    Push-Location $Path
    try {
        Write-Host "Using the temporary pull command from clipboard..."
        Invoke-Expression $normalized
        return $LASTEXITCODE
    } finally {
        Pop-Location
    }
}

if (-not (Test-Path $RepoPath)) {
    throw "Repo path not found: $RepoPath"
}

if (-not (Test-Path (Join-Path $RepoPath ".git"))) {
    throw "Not a git repository: $RepoPath"
}

if ($UseClipboardCommandOnly) {
    $result = Invoke-ClipboardPull -Path $RepoPath
    if ($result -ne 0) {
        exit $result
    }
    Write-Host "Update complete."
    exit 0
}

$clipboardCommand = Get-ClipboardPullCommand
if ($clipboardCommand) {
    $clipboardPull = Invoke-ClipboardPull -Path $RepoPath
    if ($clipboardPull -eq 0) {
        Write-Host "Update complete (clipboard temporary command)."
        exit 0
    }
}

Write-Host "Trying standard git pull..."
$normalPull = Invoke-GitPull -Path $RepoPath
if ($normalPull -eq 0) {
    Write-Host "Update complete (standard pull)."
    exit 0
}

Write-Host "Standard pull failed (private repo auth likely required)."
Write-Host "Copy command from lennysdata.com -> 'Copy command to pull updates', then rerun:"
Write-Host "  .\\update-lenny-data.cmd -UseClipboardCommandOnly"
exit 5
