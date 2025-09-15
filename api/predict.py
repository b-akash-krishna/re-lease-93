# Enhanced Flask API to host the XGBoost model with better feature processing
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # This is crucial for allowing frontend requests

# Load the model from the .joblib file
# Make sure readmission_model.joblib is in the same directory as this file
try:
    model = joblib.load('readmission_model.joblib')
    logger.info("Model loaded successfully!")
    model_available = True
except Exception as e:
    logger.error(f"Error loading model: {e}")
    logger.info("Running in mock mode - will return random predictions for testing")
    model = None
    model_available = False

def process_features(data):
    """
    Process the incoming patient data into features expected by the model.
    This is a placeholder implementation - you'll need to adjust this based on 
    your actual model's feature requirements.
    """
    try:
        # Extract and process features from the request data
        features = {}
        
        # Demographics
        features['age'] = data.get('age', 0)
        features['gender_male'] = 1 if data.get('gender', '').lower() == 'male' else 0
        features['gender_female'] = 1 if data.get('gender', '').lower() == 'female' else 0
        
        # Checkup symptoms (boolean to int)
        features['fever'] = 1 if data.get('checkup_fever', False) else 0
        features['shortness_of_breath'] = 1 if data.get('checkup_shortness_of_breath', False) else 0
        features['chest_pain'] = 1 if data.get('checkup_chest_pain', False) else 0
        features['cough'] = 1 if data.get('checkup_cough', False) else 0
        features['fatigue'] = 1 if data.get('checkup_fatigue', False) else 0
        features['allergic_reaction'] = 1 if data.get('checkup_allergic_reaction', False) else 0
        
        # Recovery indicators (inverted because these are positive signs)
        features['poor_appetite'] = 0 if data.get('checkup_appetite', False) else 1
        features['poor_sleep'] = 0 if data.get('checkup_sleep_quality', False) else 1
        features['medication_non_adherence'] = 0 if data.get('checkup_medication_adherence', False) else 1
        
        # Calculate risk score
        symptom_count = sum([
            features['fever'], features['shortness_of_breath'], 
            features['chest_pain'], features['cough'], 
            features['fatigue'], features['allergic_reaction']
        ])
        features['symptom_count'] = symptom_count
        
        recovery_issues = sum([
            features['poor_appetite'], features['poor_sleep'], 
            features['medication_non_adherence']
        ])
        features['recovery_issues'] = recovery_issues
        
        # Composite risk score
        features['risk_score'] = symptom_count + recovery_issues
        
        logger.info(f"Processed features: {features}")
        return features
        
    except Exception as e:
        logger.error(f"Error processing features: {e}")
        raise

def mock_prediction(features):
    """
    Generate a mock prediction when the actual model is not available.
    This uses simple rule-based logic for demonstration.
    """
    risk_score = features.get('risk_score', 0)
    symptom_count = features.get('symptom_count', 0)
    has_allergic_reaction = features.get('allergic_reaction', 0)
    
    # Simple rule-based mock prediction
    if has_allergic_reaction or symptom_count >= 3 or risk_score >= 4:
        return 1  # High risk of readmission
    elif symptom_count >= 1 or risk_score >= 2:
        return np.random.choice([0, 1], p=[0.7, 0.3])  # Medium risk
    else:
        return np.random.choice([0, 1], p=[0.9, 0.1])  # Low risk

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_available": model_available,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get and validate request data
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        logger.info(f"Received prediction request: {data}")
        
        # Process features
        features = process_features(data)
        
        # Make prediction
        if model_available:
            # Convert features to the format expected by your model
            # This example assumes the model expects a list of feature values
            feature_vector = [list(features.values())]
            prediction = model.predict(feature_vector)[0]
            confidence = "Model-based prediction"
        else:
            # Use mock prediction for testing
            prediction = mock_prediction(features)
            confidence = "Mock prediction (model not loaded)"
        
        # Convert prediction to human-readable format
        result = "Yes" if prediction == 1 else "No"
        
        response = {
            "prediction": result,
            "confidence": confidence,
            "risk_factors": {
                "symptom_count": features.get('symptom_count', 0),
                "recovery_issues": features.get('recovery_issues', 0),
                "total_risk_score": features.get('risk_score', 0)
            },
            "model_available": model_available,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Prediction result: {response}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if model_available:
        return jsonify({
            "model_loaded": True,
            "model_type": str(type(model).__name__),
            "timestamp": datetime.now().isoformat()
        })
    else:
        return jsonify({
            "model_loaded": False,
            "message": "Model not available - running in mock mode",
            "timestamp": datetime.now().isoformat()
        })

if __name__ == '__main__':
    logger.info("Starting Flask API server...")
    logger.info(f"Model available: {model_available}")
    # You will need to set up a proper production server (like Gunicorn) for deployment
    app.run(host='0.0.0.0', port=5000, debug=True)