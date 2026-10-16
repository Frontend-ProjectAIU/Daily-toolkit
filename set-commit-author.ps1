# Sets the author for future commits in this repository only.
# Does not change existing commits or the account used for git push.
param(
    [string]$Name = 'shaktybaymanas',
    [string]$Email = 'shaktybaymanas@gmail.com'
)

$ErrorActionPreference = 'Stop'
$repoRoot = $PSScriptRoot

if (-not (Test-Path -LiteralPath (Join-Path $repoRoot '.git'))) {
    throw 'Keep this script in the root of the Git repository.'
}

& git -C $repoRoot config --local user.name $Name
if ($LASTEXITCODE -ne 0) { throw 'Could not set the author name.' }

& git -C $repoRoot config --local user.email $Email
if ($LASTEXITCODE -ne 0) { throw 'Could not set the author email.' }

Write-Output "Future commits in this repository: $Name <$Email>"
Write-Output 'Existing commits and the account used for git push are unchanged.'
