#!/bin/bash

# Deploy script for Fractal Thought Engine to S3
# Usage: ./deploy.sh [--dry-run]

set -e  # Exit on any error

# Configuration
S3_BUCKET="s3://fractalthoughtengine.com"
BUILD_DIR="_site"
AWS_PROFILE="${AWS_PROFILE:-default}"
DRY_RUN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --profile)
      AWS_PROFILE="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [--dry-run] [--profile PROFILE]"
      echo "  --dry-run    Show what would be uploaded without actually doing it"
      echo "  --profile    AWS profile to use (default: default)"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment to ${S3_BUCKET}${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Jekyll is installed
if ! command -v jekyll &> /dev/null; then
    echo -e "${RED}❌ Jekyll is not installed. Please install it first.${NC}"
    exit 1
fi

# Verify AWS credentials
echo -e "${YELLOW}🔐 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured for profile: $AWS_PROFILE${NC}"
    exit 1
fi

# Clean previous build
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
fi

# Build the Jekyll site
echo -e "${YELLOW}🔨 Building Jekyll site...${NC}"
JEKYLL_ENV=production bundle exec jekyll build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Jekyll build failed - $BUILD_DIR directory not found${NC}"
    exit 1
fi

# Deploy to S3
echo -e "${YELLOW}☁️  Deploying to S3...${NC}"

# S3 sync options
SYNC_OPTIONS=(
    --profile "$AWS_PROFILE"
    --delete
    --exact-timestamps
    --exclude "*.DS_Store"
    --exclude ".git/*"
    --exclude ".gitignore"
    --exclude "README.md"
    --exclude "LICENSE"
)

# Add dry-run flag if specified
if [ "$DRY_RUN" = true ]; then
    SYNC_OPTIONS+=(--dryrun)
    echo -e "${YELLOW}🔍 DRY RUN MODE - No files will be uploaded${NC}"
fi

# Sync files to S3
aws s3 sync "$BUILD_DIR/" "$S3_BUCKET" "${SYNC_OPTIONS[@]}"

# Set proper content types and cache headers
if [ "$DRY_RUN" = false ]; then
    echo -e "${YELLOW}🏷️  Setting content types and cache headers...${NC}"
    
    # HTML files - no cache for dynamic content
    aws s3 cp "$S3_BUCKET" "$S3_BUCKET" \
        --recursive \
        --exclude "*" \
        --include "*.html" \
        --metadata-directive REPLACE \
        --content-type "text/html; charset=utf-8" \
        --cache-control "no-cache, no-store, must-revalidate" \
        --profile "$AWS_PROFILE"
    
    # CSS files - cache for 1 week
    aws s3 cp "$S3_BUCKET" "$S3_BUCKET" \
        --recursive \
        --exclude "*" \
        --include "*.css" \
        --metadata-directive REPLACE \
        --content-type "text/css" \
        --cache-control "max-age=604800" \
        --profile "$AWS_PROFILE"
    
    # JavaScript files - cache for 1 week
    aws s3 cp "$S3_BUCKET" "$S3_BUCKET" \
        --recursive \
        --exclude "*" \
        --include "*.js" \
        --metadata-directive REPLACE \
        --content-type "application/javascript" \
        --cache-control "max-age=604800" \
        --profile "$AWS_PROFILE"
    
    # Image files - cache for 1 month
    aws s3 cp "$S3_BUCKET" "$S3_BUCKET" \
        --recursive \
        --exclude "*" \
        --include "*.jpg" \
        --include "*.jpeg" \
        --include "*.png" \
        --include "*.gif" \
        --include "*.svg" \
        --include "*.webp" \
        --metadata-directive REPLACE \
        --cache-control "max-age=2592000" \
        --profile "$AWS_PROFILE"
    
    # XML files (feeds, sitemaps)
    aws s3 cp "$S3_BUCKET" "$S3_BUCKET" \
        --recursive \
        --exclude "*" \
        --include "*.xml" \
        --metadata-directive REPLACE \
        --content-type "application/xml" \
        --cache-control "max-age=3600" \
        --profile "$AWS_PROFILE"
fi

if [ "$DRY_RUN" = false ]; then
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo -e "${BLUE}🌐 Site URL: https://fractalthoughtengine.com${NC}"
else
    echo -e "${GREEN}✅ Dry run completed - review the changes above${NC}"
fi

# Optional: Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ] && [ "$DRY_RUN" = false ]; then
    echo -e "${YELLOW}🔄 Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --profile "$AWS_PROFILE"
    echo -e "${GREEN}✅ CloudFront invalidation initiated${NC}"
fi