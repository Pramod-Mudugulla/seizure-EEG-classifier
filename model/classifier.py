"""
Seizure Classifier
Loads trained LSTM model and provides prediction functionality
"""

import numpy as np
import os
import pickle
from tensorflow import keras

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "seizure_classifier.h5")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.pkl")


class SeizureClassifier:
    """LSTM-based EEG seizure classifier"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.metrics = None
        self._load_model()
    
    def _load_model(self):
        """Load the trained model and scaler"""
        try:
            # Load model
            if os.path.exists(MODEL_PATH):
                self.model = keras.models.load_model(MODEL_PATH)
                print(f"Model loaded from {MODEL_PATH}")
            else:
                print(f"Warning: Model not found at {MODEL_PATH}")
                print("Please run train_model.py first to train the model")
            
            # Load scaler
            if os.path.exists(SCALER_PATH):
                with open(SCALER_PATH, 'rb') as f:
                    self.scaler = pickle.load(f)
                print(f"Scaler loaded from {SCALER_PATH}")
            else:
                print(f"Warning: Scaler not found at {SCALER_PATH}")
            
            # Load metrics
            if os.path.exists(METRICS_PATH):
                with open(METRICS_PATH, 'rb') as f:
                    self.metrics = pickle.load(f)
                    
        except Exception as e:
            print(f"Error loading model: {e}")
    
    def is_ready(self):
        """Check if model is ready for predictions"""
        return self.model is not None and self.scaler is not None
    
    def get_accuracy(self):
        """Get model accuracy from saved metrics"""
        if self.metrics:
            return self.metrics.get('accuracy')
        return None
    
    def preprocess(self, data):
        """Preprocess input data for prediction"""
        data = np.array(data)
        
        # Ensure 2D array
        if data.ndim == 1:
            data = data.reshape(1, -1)
        
        # Validate shape (should have 178 features)
        if data.shape[1] != 178:
            raise ValueError(f"Expected 178 features, got {data.shape[1]}")
        
        # Scale data
        if self.scaler:
            data = self.scaler.transform(data)
        
        return data
    
    def predict(self, data):
        """
        Make predictions on EEG data
        
        Args:
            data: numpy array of shape (n_samples, 178) or (178,)
            
        Returns:
            List of tuples (prediction, confidence)
            prediction: 1 for seizure, 0 for non-seizure
            confidence: float between 0 and 1
        """
        if not self.is_ready():
            raise RuntimeError("Model not ready. Please train the model first.")
        
        # Preprocess
        processed_data = self.preprocess(data)
        
        # Get predictions
        probabilities = self.model.predict(processed_data, verbose=0)
        
        results = []
        for prob in probabilities:
            confidence = float(prob[0])
            prediction = 1 if confidence >= 0.35 else 0  # Lowered threshold for better seizure sensitivity
            # Adjust confidence to be the confidence in the predicted class
            adjusted_confidence = confidence if prediction == 1 else 1 - confidence
            results.append((prediction, adjusted_confidence))
        
        return results
    
    def predict_single(self, signal):
        """Convenience method for single sample prediction"""
        results = self.predict(signal)
        return results[0]
