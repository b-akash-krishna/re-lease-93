# A simple Flask API to host the XGBoost model
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This is crucial for allowing frontend requests

# Load the model from the .joblib file
# Make sure readmission_model.joblib is in the same directory as this file
try:
    model = joblib.load('readmission_model.joblib')
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({"error": "Model not available."}), 500

    try:
        data = request.get_json()
        
        # This is a placeholder for the actual feature processing.
        # You will need to convert the patient's data into the format
        # expected by your model (e.g., a Pandas DataFrame with specific columns).
        # For now, we'll assume the input is a single feature for demonstration.
        input_data = [data.get('risk_score', 0)]
        
        # Make a prediction
        prediction = model.predict([input_data])[0]
        
        # Convert prediction to a human-readable format
        result = "Yes" if prediction == 1 else "No"
        
        return jsonify({"prediction": result})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    # You will need to set up a proper production server (like Gunicorn) for deployment
    app.run(host='0.0.0.0', port=5000)