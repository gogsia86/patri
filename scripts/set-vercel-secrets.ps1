param(
  [string]$Repo = "gogsia86/patri"
)

$ErrorActionPreference = "Stop"

Write-Host "Setting GitHub Actions secrets for $Repo"

$vercelToken = Read-Host "Enter VERCEL_TOKEN (input hidden is not supported by gh secret set, but value will not be echoed)"
$vercelOrgId = Read-Host "Enter VERCEL_ORG_ID"
$vercelProjectId = Read-Host "Enter VERCEL_PROJECT_ID"

if ([string]::IsNullOrWhiteSpace($vercelToken) -or [string]::IsNullOrWhiteSpace($vercelOrgId) -or [string]::IsNullOrWhiteSpace($vercelProjectId)) {
  throw "All values are required."
}

$vercelToken | gh secret set VERCEL_TOKEN --repo $Repo
$vercelOrgId | gh secret set VERCEL_ORG_ID --repo $Repo
$vercelProjectId | gh secret set VERCEL_PROJECT_ID --repo $Repo

Write-Host "Secrets updated successfully for $Repo"
Write-Host "Run: gh secret list --repo $Repo"
