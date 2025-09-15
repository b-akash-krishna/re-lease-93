# Enhanced Flask API to host the XGBoost model with correct feature processing
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
    Process the incoming patient data into features expected by the XGBoost model.
    The model expects these specific features based on hospital administrative data.
    """
    try:
        features = {}
        
        # Patient Demographics
        features['age'] = data.get('age', 0)
        features['length_of_stay'] = data.get('length_of_stay', 0)
        
        # Medical Procedures & Medications
        features['num_lab_procedures'] = data.get('num_lab_procedures', 0)
        features['num_other_procedures'] = data.get('num_other_procedures', 0)
        features['num_medications'] = data.get('num_medications', 0)
        
        # Healthcare Utilization (past year)
        features['outpatient_visits'] = data.get('outpatient_visits', 0)
        features['previous_inpatient_stays'] = data.get('previous_inpatient_stays', 0)
        features['emergency_visits'] = data.get('emergency_visits', 0)
        
        # Diabetes Management
        # Convert yes/no to 1/0
        diabetes_med = data.get('diabetes_medication', 'no')
        features['diabetes_medication'] = 1 if diabetes_med.lower() == 'yes' else 0
        
        # Convert glucose test result to numerical encoding
        glucose_result = data.get('glucose_test', 'normal').lower()
        features['glucose_normal'] = 1 if glucose_result == 'normal' else 0
        features['glucose_high'] = 1 if glucose_result == 'high' else 0
        features['glucose_not_done'] = 1 if glucose_result == 'not_done' else 0
        
        # Convert A1C test result to numerical encoding
        a1c_result = data.get('a1c_test', 'normal').lower()
        features['a1c_normal'] = 1 if a1c_result == 'normal' else 0
        features['a1c_high'] = 1 if a1c_result == 'high' else 0
        features['a1c_not_done'] = 1 if a1c_result == 'not_done' else 0
        
        logger.info(f"Processed features: {features}")
        return features
        
    except Exception as e:
        logger.error(f"Error processing features: {e}")
        raise

def mock_prediction(features):
    """
    Generate a mock prediction when the actual model is not available.
    This uses rule-based logic based on the actual model features.
    """
    # Risk factors based on the actual model features
    risk_score = 0
    
    # Age factor
    age = features.get('age', 0)
    if age > 65:
        risk_score += 2
    elif age > 45:
        risk_score += 1
    
    # Length of stay factor
    los = features.get('length_of_stay', 0)
    if los > 7:
        risk_score += 2
    elif los > 3:
        risk_score += 1
    
    # Healthcare utilization factors
    prev_stays = features.get('previous_inpatient_stays', 0)
    emergency_visits = features.get('emergency_visits', 0)
    if prev_stays > 2 or emergency_visits > 3:
        risk_score += 2
    elif prev_stays > 0 or emergency_visits > 1:
        risk_score += 1
    
    # Diabetes complications
    if features.get('diabetes_medication', 0) and features.get('a1c_high', 0):
        risk_score += 2
    
    # High number of procedures/medications
    total_procedures = features.get('num_lab_procedures', 0) + features.get('num_other_procedures', 0)
    if total_procedures > 10 or features.get('num_medications', 0) > 5:
        risk_score += 1
    
    # Simple threshold-based prediction
    if risk_score >= 4:
        return 1  # High risk
    elif risk_score >= 2:
        return np.random.choice([0, 1], p=[0.6, 0.4])  # Medium risk
    else:
        return np.random.choice([0, 1], p=[0.85, 0.15])  # Low risk

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_available": model_available,
        "timestamp": datetime.now().isoformat(),
        "expected_features": [
            "age", "length_of_stay", "num_lab_procedures", "num_other_procedures",
            "num_medications", "outpatient_visits", "previous_inpatient_stays", 
            "emergency_visits", "diabetes_medication", "glucose_test", "a1c_test"
        ]
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
            # Create feature vector in the exact order expected by the model
            # You may need to adjust this order based on your model's training data
            feature_names = [
                'age', 'length_of_stay', 'num_lab_procedures', 'num_other_procedures',
                'num_medications', 'outpatient_visits', 'previous_inpatient_stays', 
                'emergency_visits', 'diabetes_medication', 'glucose_normal', 
                'glucose_high', 'glucose_not_done', 'a1c_normal', 'a1c_high', 'a1c_not_done'
            ]
            
            feature_vector = [[features.get(name, 0) for name in feature_names]]
            prediction = model.predict(feature_vector)[0]
            
            # Get prediction probability if available
            try:
                probability = model.predict_proba(feature_vector)[0]
                confidence_score = float(max(probability))
                confidence = f"Model confidence: {confidence_score:.2%}"
            except:
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
                "age": features.get('age', 0),
                "length_of_stay": features.get('length_of_stay', 0),
                "previous_hospitalizations": features.get('previous_inpatient_stays', 0),
                "emergency_visits": features.get('emergency_visits', 0),
                "diabetes_medication": bool(features.get('diabetes_medication', 0)),
                "total_procedures": features.get('num_lab_procedures', 0) + features.get('num_other_procedures', 0)
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
    try:
        if model_available:
            model_info = {
                "model_loaded": True,
                "model_type": str(type(model).__name__),
                "timestamp": datetime.now().isoformat()
            }
            
            # Try to get model-specific information
            try:
                if hasattr(model, 'n_features_in_'):
                    model_info["n_features"] = model.n_features_in_
                if hasattr(model, 'feature_names_in_'):
                    model_info["feature_names"] = list(model.feature_names_in_)
                if hasattr(model, 'n_classes_'):
                    model_info["n_classes"] = model.n_classes_
            except:
                pass
                
            return jsonify(model_info)
        else:
            return jsonify({
                "model_loaded": False,
                "message": "Model not available - running in mock mode",
                "timestamp": datetime.now().isoformat()
            })
    except Exception as e:
        return jsonify({
            "error": f"Could not get model info: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    logger.info("Starting Flask API server...")
    logger.info(f"Model available: {model_available}")
    # You will need to set up a proper production server (like Gunicorn) for deployment
    app.run(host='0.0.0.0', port=5000, debug=True)