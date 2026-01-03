#!/bin/bash
# Netlify Deployment Script for Origin Korea
# Usage:
#   NETLIFY_AUTH_TOKEN=your_token ./deploy-netlify.sh                    # Deploy draft
#   NETLIFY_AUTH_TOKEN=your_token NETLIFY_SITE_ID=id ./deploy-netlify.sh # Deploy prod

set -e

echo "🚀 Origin Korea - Netlify Deployment"
echo "====================================="
echo ""

# Check if NETLIFY_AUTH_TOKEN is set
if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
    echo "❌ Error: NETLIFY_AUTH_TOKEN is not set"
    echo ""
    echo "To deploy, you need a Netlify Personal Access Token:"
    echo ""
    echo "1. Go to https://app.netlify.com/user/applications#personal-access-tokens"
    echo "2. Click 'New access token'"
    echo "3. Give it a name like 'CLI Deploy'"
    echo "4. Copy the token and run:"
    echo ""
    echo "   NETLIFY_AUTH_TOKEN=your_token_here ./deploy-netlify.sh"
    echo ""
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Type check
echo "🔍 Running type check..."
bun run lint || echo "⚠️  Type check had warnings (continuing...)"

# Build the project
echo "🔨 Building project..."
bun run build

# Check build output
if [ ! -d ".next" ]; then
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."

if [ -z "$NETLIFY_SITE_ID" ]; then
    echo "ℹ️  No NETLIFY_SITE_ID set - creating a new draft deploy..."
    echo "   (Set NETLIFY_SITE_ID to deploy to production)"
    echo ""

    npx netlify deploy --auth "$NETLIFY_AUTH_TOKEN" --message "Draft deploy from CLI"

    echo ""
    echo "📝 To get your Site ID for production deployments:"
    echo "   1. Go to your site in the Netlify Dashboard"
    echo "   2. Go to Site Settings > General > Site Information"
    echo "   3. Copy the 'API ID'"
else
    echo "ℹ️  Deploying to production site: $NETLIFY_SITE_ID"
    echo ""

    npx netlify deploy \
        --auth "$NETLIFY_AUTH_TOKEN" \
        --site "$NETLIFY_SITE_ID" \
        --prod \
        --message "Production deploy from CLI"
fi

echo ""
echo "✅ Deployment complete!"
