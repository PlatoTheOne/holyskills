param(
    [int]$Port = 8788,
    [string]$Source = "lennys-newsletterpodcastdata-all",
    [string]$InvitedEmail = "0xplato@gmail.com",
    [string]$InviteCode = "plato666",
    [string]$AllowedOrigin = "https://platotheone.github.io",
    [int]$TokenTtlSec = 86400
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($InvitedEmail) -and [string]::IsNullOrWhiteSpace($InviteCode)) {
    throw "Please provide -InvitedEmail or -InviteCode."
}

$env:ACCESS_EMAIL = $InvitedEmail
$env:ACCESS_INVITE_CODE = $InviteCode
$env:ALLOWED_ORIGIN = $AllowedOrigin
$env:ACCESS_TOKEN_TTL_SEC = "$TokenTtlSec"

Write-Host "Starting private content API on port $Port ..."
Write-Host "Allowed origin: $AllowedOrigin"
if (-not [string]::IsNullOrWhiteSpace($InvitedEmail)) {
    Write-Host "Invited email: $InvitedEmail"
}
if (-not [string]::IsNullOrWhiteSpace($InviteCode)) {
    Write-Host "Invite code: [provided]"
}

node (Join-Path $PSScriptRoot "scripts\private-content-api.mjs") --port $Port --source $Source
