#!/bin/bash

# Simple version bump script
# Usage: ./simple-release.sh "commit message"

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"commit message\""
    exit 1
fi

COMMIT_MESSAGE="$1"

# Get current version and bump minor
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Bump minor version (resets patch to 0)
npm version minor --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "New version: $NEW_VERSION"

# Git operations
git add package.json package-lock.json 2>/dev/null || git add package.json
git commit -m "v$NEW_VERSION: $COMMIT_MESSAGE"
git tag -a "v$NEW_VERSION" -m "$COMMIT_MESSAGE"
git push origin $(git branch --show-current)
git push origin "v$NEW_VERSION"

# Publish to npm
npm publish

echo "✅ Released $NEW_VERSION"
