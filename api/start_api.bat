@echo off
echo 🚀 Starting Healthcare Prediction API Server...

REM Check if we're in the correct directory
if not exist "predict.py" (
    echo ❌ Error: predict.py not found. Please run this script from the api\ directory.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is required but not installed.
    pause
    exit /b 1
)

REM Check if virtual environment exists, if not create it
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo 📋 Installing dependencies...
pip install -r requirements.txt

REM Check if model file exists
if not exist "readmission_model.joblib" (
    echo ⚠️  Warning: readmission_model.joblib not found. Server will run in mock mode.
) else (
    echo ✅ Model file found: readmission_model.joblib
)

REM Start the server
echo 🌐 Starting Flask server on http://localhost:5000
echo 📊 Server will provide both AI-based and rule-based predictions
echo 🔄 Press Ctrl+C to stop the server
echo.

python predict.py

pause