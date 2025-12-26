"""
Flask Backend API for EEG Seizure Classification
"""

import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(".env.local")

from inference import analyze_csv_signal, analyze_image_with_gemini

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "message": "EEG Analysis API is running"})


@app.route("/api/analyze/csv", methods=["POST"])
def analyze_csv():
    """
    Analyze EEG signal from CSV data.
    
    Expected JSON body:
    {
        "values": [0.1, 0.2, 0.3, ...],
        "samplingRate": 256,
        "channel": "FP1-F7"
    }
    """
    start_time = time.time()
    
    try:
        data = request.get_json()
        
        if not data or "values" not in data:
            return jsonify({"error": "Missing 'values' in request body"}), 400
        
        values = data["values"]
        
        if not isinstance(values, list) or len(values) == 0:
            return jsonify({"error": "'values' must be a non-empty array"}), 400
        
        # Perform analysis
        result = analyze_csv_signal(values)
        
        # Add inference time
        inference_time_ms = round((time.time() - start_time) * 1000)
        result["inferenceTimeMs"] = inference_time_ms
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error analyzing CSV: {e}")
        return jsonify({"error": "Analysis failed. Please try again."}), 500


@app.route("/api/analyze/image", methods=["POST"])
def analyze_image():
    """
    Analyze EEG image using Gemini AI.
    
    Expected JSON body:
    {
        "image": "data:image/jpeg;base64,/9j/4AAQ..."
    }
    """
    start_time = time.time()
    
    try:
        data = request.get_json()
        
        if not data or "image" not in data:
            return jsonify({"error": "Missing 'image' in request body"}), 400
        
        base64_image = data["image"]
        
        if not isinstance(base64_image, str) or len(base64_image) == 0:
            return jsonify({"error": "'image' must be a non-empty base64 string"}), 400
        
        # Perform analysis with Gemini
        result = analyze_image_with_gemini(base64_image)
        
        # Add inference time
        inference_time_ms = round((time.time() - start_time) * 1000)
        result["inferenceTimeMs"] = inference_time_ms
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    
    print(f"Starting EEG Analysis API on port {port}")
    print(f"Debug mode: {debug}")
    
    app.run(host="0.0.0.0", port=port, debug=debug)
