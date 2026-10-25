#!/bin/bash

# React Router 7 Starter - Extract and Test Script
# This script extracts the starter template and runs basic validation

set -e

echo "🚀 React Router 7 Starter - Extraction & Test"
echo "=============================================="
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Navigate to root
cd "$ROOT_DIR"

echo "📦 Step 1: Running extraction script..."
echo ""
npx tsx scripts/create-starter.ts

echo ""
echo "✅ Extraction complete!"
echo ""

# Check if starter-template exists
if [ ! -d "starter-template" ]; then
    echo "❌ Error: starter-template directory not found!"
    exit 1
fi

echo "📋 Step 2: Validating extracted files..."
echo ""

# Check key files exist
declare -a required_files=(
    "starter-template/package.json"
    "starter-template/README.md"
    "starter-template/ARCHITECTURE.md"
    "starter-template/app/db/schema/index.ts"
    "starter-template/app/routes/_public.tsx"
    "starter-template/.env.example"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ Missing: $file"
        exit 1
    fi
done

echo ""
echo "🔍 Step 3: Checking for excluded features..."
echo ""

# Check that excluded features are NOT present
if [ -d "starter-template/app/features/posts" ]; then
    echo "  ❌ Error: 'posts' feature should be excluded!"
    exit 1
else
    echo "  ✅ 'posts' feature correctly excluded"
fi

if [ -d "starter-template/app/features/learners" ]; then
    echo "  ❌ Error: 'learners' feature should be excluded!"
    exit 1
else
    echo "  ✅ 'learners' feature correctly excluded"
fi

if [ -d "starter-template/app/features/goals" ]; then
    echo "  ❌ Error: 'goals' feature should be excluded!"
    exit 1
else
    echo "  ✅ 'goals' feature correctly excluded"
fi

echo ""
echo "🗂️  Step 4: Checking included features..."
echo ""

# Check that included features ARE present
declare -a included_features=(
    "auth"
    "users"
    "roles"
    "permissions"
    "email"
    "media"
    "audit-log"
    "privacy"
    "admin"
)

for feature in "${included_features[@]}"; do
    if [ -d "starter-template/app/features/$feature" ]; then
        echo "  ✅ $feature"
    else
        echo "  ❌ Missing feature: $feature"
        exit 1
    fi
done

echo ""
echo "📄 Step 5: Checking database schema..."
echo ""

# Check schema doesn't reference excluded features
if grep -q "posts" starter-template/app/db/schema/index.ts; then
    echo "  ❌ Error: Schema still references 'posts'"
    exit 1
else
    echo "  ✅ Schema doesn't reference excluded features"
fi

echo ""
echo "🎉 All validation checks passed!"
echo ""
echo "📦 Zip file created at: react-router-starter.zip"
echo ""
echo "🧪 To test the starter:"
echo "   cd starter-template"
echo "   pnpm install"
echo "   cp .env.example .env"
echo "   # Edit .env with your test database"
echo "   pnpm db:push"
echo "   pnpm typecheck"
echo "   pnpm dev"
echo ""
echo "📋 Or extract the zip to test:"
echo "   unzip react-router-starter.zip -d my-test-project"
echo "   cd my-test-project"
echo "   pnpm install"
echo ""
