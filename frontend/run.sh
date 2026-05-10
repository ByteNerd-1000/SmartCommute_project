#!/bin/bash
# SmartCommute Frontend Startup Script

set -e

echo "🚀 SmartCommute Frontend Startup"
echo "======================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi

echo "✓ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

echo "✓ npm $(npm --version) found"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Copy .env if not exists
if [ ! -f ".env" ]; then
    echo "⚙️  Copying .env.example to .env"
    cp .env.example .env
fi

# Start development server
echo "🎯 Starting SmartCommute Frontend..."
echo "📍 http://localhost:5173"

npm run dev
