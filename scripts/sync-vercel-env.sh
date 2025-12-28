#!/bin/bash

# ==============================================================================
# B2BChat Vercel Environment Sync Script
# Author: Senior DevOps Engineer (Antigravity)
# Version: 1.0.0
# Description: Synchronizes B2BCHAT_* namespace variables with Vercel CLI.
# ==============================================================================

set -euo pipefail

# Configuration
ENV_FILE=".env.b2bchat.production"
TARGET_ENV="production"
NAMESPACE="B2BCHAT_"
PUBLIC_NAMESPACE="NEXT_PUBLIC_B2BCHAT_"

echo "🚀 Starting B2BChat Environment Sync..."

# 1. Prerequisites Check
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI is not installed. Run 'npm i -g vercel'."
    exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
    echo "❌ Error: Config file $ENV_FILE not found."
    exit 1
fi

# 2. Authentication (Optional - assumes VERCEL_TOKEN is in GH Actions or local login)
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
    echo "🔐 Authenticating with Vercel Token..."
    vercel login --token="$VERCEL_TOKEN"
fi

# 3. Read and Validate Variables
echo "🔍 Validating variables in $ENV_FILE..."

while IFS='=' read -r name value || [[ -n "$name" ]]; do
    # Skip comments and empty lines
    [[ "$name" =~ ^#.*$ || -z "$name" ]] && continue
    
    # Trim quotes from value if present
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

    # VALIDATION: Check for allowed namespace
    if [[ ! "$name" =~ ^$NAMESPACE ]] && [[ ! "$name" =~ ^$PUBLIC_NAMESPACE ]]; then
        echo "❌ ERROR: Variable '$name' does not follow B2BCHAT_ naming convention."
        echo "   Aborting sync to prevent legacy collisions."
        exit 1
    fi

    # VALIDATION: Check for empty values
    if [[ -z "$value" ]]; then
        echo "❌ ERROR: Variable '$name' has an empty value."
        exit 1
    fi

    # 4. Secure Sync
    echo "🔄 Syncing: $name"
    
    # Remove existing to avoid conflicts, suppress errors if it doesn't exist
    vercel env rm "$name" "$TARGET_ENV" --yes &> /dev/null || true
    
    # Add new value securely using pipe (prevents value from showing in 'ps')
    echo -n "$value" | vercel env add "$name" "$TARGET_ENV"
    
done < "$ENV_FILE"

echo "✅ Sync completed successfully!"
echo "📡 Current B2BCHAT variables in Vercel:"
vercel env ls "$TARGET_ENV" | grep "B2BCHAT_"
