#!/bin/bash

# n8n Integration Build and Run Script
# This script builds the n8n integration project and starts n8n with debug logging

set -e  # Exit on any error

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

# Start n8n with debug logging
echo "🚀 Starting n8n with debug logging..."
echo "⚠️  Press Ctrl+C to stop n8n"
echo ""

N8N_LOG_LEVEL=debug n8n start
