#!/bin/bash
# SmartCommute Backend Startup Script

set -e

echo "🚀 SmartCommute Backend Startup"
echo "=================================="

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found"
    exit 1
fi

echo "✓ Python 3 found"

# Create virtual environment if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate
echo "✓ Virtual environment activated"

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt -q

# Copy .env if not exists
if [ ! -f ".env" ]; then
    echo "⚙️  Copying .env.example to .env"
    cp .env.example .env
    echo "⚠️  Edit .env with your configuration"
fi

# Run the application
echo "🎯 Starting SmartCommute API Server..."
echo "📍 http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
