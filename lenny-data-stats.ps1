param(
    [string]$RepoPath = (Join-Path $PSScriptRoot "lennys-newsletterpodcastdata-all"),
    [switch]$IncludeGit
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $RepoPath)) {
    throw "Repo path not found: $RepoPath"
}

$gitRoot = Join-Path $RepoPath ".git"
$gitPrefix = $gitRoot + [System.IO.Path]::DirectorySeparatorChar

$files = Get-ChildItem -Path $RepoPath -Recurse -File -Force
if (-not $IncludeGit) {
    $files = $files | Where-Object {
        -not $_.FullName.StartsWith($gitPrefix, [System.StringComparison]::OrdinalIgnoreCase)
    }
}

$totalFiles = $files.Count
$totalBytes = ($files | Measure-Object -Property Length -Sum).Sum
if (-not $totalBytes) {
    $totalBytes = 0
}

function Format-Bytes {
    param([long]$Bytes)
    if ($Bytes -ge 1GB) { return "{0:N2} GB" -f ($Bytes / 1GB) }
    if ($Bytes -ge 1MB) { return "{0:N2} MB" -f ($Bytes / 1MB) }
    if ($Bytes -ge 1KB) { return "{0:N2} KB" -f ($Bytes / 1KB) }
    return "$Bytes B"
}

Write-Host "Repo: $RepoPath"
Write-Host "Scope: $(if ($IncludeGit) { 'including .git' } else { 'excluding .git' })"
Write-Host "Files: $totalFiles"
Write-Host "Size : $(Format-Bytes -Bytes $totalBytes) ($totalBytes bytes)"
Write-Host ""

$topDirs = Get-ChildItem -Path $RepoPath -Directory -Force
if (-not $IncludeGit) {
    $topDirs = $topDirs | Where-Object { $_.Name -ne ".git" }
}

Write-Host "Top-level directory breakdown:"
foreach ($dir in $topDirs) {
    $dirFiles = Get-ChildItem -Path $dir.FullName -Recurse -File -Force
    if (-not $IncludeGit) {
        $dirFiles = $dirFiles | Where-Object {
            -not $_.FullName.StartsWith($gitPrefix, [System.StringComparison]::OrdinalIgnoreCase)
        }
    }
    $dirCount = $dirFiles.Count
    $dirBytes = ($dirFiles | Measure-Object -Property Length -Sum).Sum
    if (-not $dirBytes) { $dirBytes = 0 }
    Write-Host ("- {0}: {1} files, {2}" -f $dir.Name, $dirCount, (Format-Bytes -Bytes $dirBytes))
}
