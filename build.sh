#!/bin/bash

# n8n Integration Build and Run Script
# This script builds the n8n integration project and starts n8n with debug logging

set -e  # Exit on any error

echo "🔨 Using node version: $(node -v)"

echo "🔨 Building n8n integration project..."

# Navigate to project directory
cd /Users/karsh/Programs/web/onetap-n8n

echo "📁 Current directory: $(pwd)"

# Build the project
echo "🏗️  Running npm build..."
npm run build

# Copy dist files to n8n custom directory
echo "📋 Copying built files to n8n custom directory..."
cp -r dist/* ~/.n8n/custom/

echo "✅ Build and copy completed successfully!"

# Navigate to n8n directory
echo "📁 Changing to n8n directory..."
cd /Users/karsh/.n8n

echo "📁 Current directory: $(pwd)"

# Check if n8n is installed
echo "🔍 Checking if n8n is installed..."
if ! command -v n8n &> /dev/null; then
    echo "❌ Error: n8n is not installed or not found in PATH"
    echo "Please install n8n first by running: npm install -g n8n"
    exit 1
fi

echo "✅ n8n found: $(which n8n)"

# Start n8n with debug logging
echo "🚀 Starting n8n with debug logging..."
echo "🔓 Running n8n without authentication (open access)"
echo "⚠️  Press Ctrl+C to stop n8n"
echo ""

N8N_LOG_LEVEL=debug n8n start
