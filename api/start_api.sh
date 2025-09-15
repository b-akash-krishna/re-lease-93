#!/bin/bash

# Start API Server Script
# This script sets up and starts the Flask API server

echo "🚀 Starting Healthcare Prediction API Server..."

# Check if we're in the correct directory
if [ ! -f "predict.py" ]; then
    echo "❌ Error: predict.py not found. Please run this script from the api/ directory."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed."
    exit 1
fi

# Check if virtual environment exists, if not create it
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📋 Installing dependencies..."
pip install -r requirements.txt

# Check if model file exists
if [ ! -f "readmission_model.joblib" ]; then
    echo "⚠️  Warning: readmission_model.joblib not found. Server will run in mock mode."
else
    echo "✅ Model file found: readmission_model.joblib"
fi

# Start the server
echo "🌐 Starting Flask server on http://localhost:5000"
echo "📊 Server will provide both AI-based and rule-based predictions"
echo "🔄 Press Ctrl+C to stop the server"
echo ""

python3 predict.py