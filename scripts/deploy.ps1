# PowerShell deployment script for Windows users
param(
    [switch]$DryRun,
    [string]$Profile = "default",
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage: .\deploy.ps1 [-DryRun] [-Profile PROFILE]"
    Write-Host "  -DryRun    Show what would be uploaded without actually doing it"
    Write-Host "  -Profile   AWS profile to use (default: default)"
    exit 0
}

# Configuration
$S3_BUCKET = "s3://fractalthoughtengine.com"
$BUILD_DIR = "_site"

Write-Host "🚀 Starting deployment to $S3_BUCKET" -ForegroundColor Blue

# Check if AWS CLI is installed
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if Jekyll is installed
if (!(Get-Command jekyll -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Jekyll is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Verify AWS credentials
Write-Host "🔐 Checking AWS credentials..." -ForegroundColor Yellow
try {
    aws sts get-caller-identity --profile $Profile | Out-Null
} catch {
    Write-Host "❌ AWS credentials not configured for profile: $Profile" -ForegroundColor Red
    exit 1
}

# Clean previous build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path $BUILD_DIR) {
    Remove-Item -Recurse -Force $BUILD_DIR
}

# Build the Jekyll site
Write-Host "🔨 Building Jekyll site..." -ForegroundColor Yellow
$env:JEKYLL_ENV = "production"
bundle exec jekyll build

# Check if build was successful
if (!(Test-Path $BUILD_DIR)) {
    Write-Host "❌ Jekyll build failed - $BUILD_DIR directory not found" -ForegroundColor Red
    exit 1
}

# Deploy to S3
Write-Host "☁️ Deploying to S3..." -ForegroundColor Yellow

$syncArgs = @(
    "s3", "sync", "$BUILD_DIR/", $S3_BUCKET,
    "--profile", $Profile,
    "--delete",
    "--exact-timestamps",
    "--exclude", "*.DS_Store",
    "--exclude", ".git/*",
    "--exclude", ".gitignore",
    "--exclude", "README.md",
    "--exclude", "LICENSE"
)

if ($DryRun) {
    $syncArgs += "--dryrun"
    Write-Host "🔍 DRY RUN MODE - No files will be uploaded" -ForegroundColor Yellow
}

& aws @syncArgs

if (!$DryRun) {
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Site URL: https://fractalthoughtengine.com" -ForegroundColor Blue
} else {
    Write-Host "✅ Dry run completed - review the changes above" -ForegroundColor Green
}