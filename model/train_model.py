"""
LSTM Model Training Script
Downloads UCI Epileptic Seizure Recognition dataset and trains an LSTM classifier
"""

import numpy as np
import pandas as pd
import os
import urllib.request
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import pickle

# Dataset URL - Using Kaggle mirror
DATASET_URLS = [
    "https://raw.githubusercontent.com/akshayg056/Epileptic-seizure-detection-/master/data.csv",
    "https://archive.ics.uci.edu/ml/machine-learning-databases/00388/data.csv"
]

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(DATA_DIR, "data.csv")
MODEL_PATH = os.path.join(DATA_DIR, "seizure_classifier.h5")
SCALER_PATH = os.path.join(DATA_DIR, "scaler.pkl")
METRICS_PATH = os.path.join(DATA_DIR, "metrics.pkl")


def download_dataset():
    """Download the UCI Epileptic Seizure Recognition dataset"""
    if os.path.exists(DATA_PATH):
        print(f"Dataset already exists at {DATA_PATH}")
        return True
    
    print("Downloading dataset...")
    
    for url in DATASET_URLS:
        try:
            print(f"Trying: {url}")
            urllib.request.urlretrieve(url, DATA_PATH)
            print(f"Dataset downloaded to {DATA_PATH}")
            return True
        except Exception as e:
            print(f"Failed: {e}")
            continue
    
    print("=" * 60)
    print("MANUAL DOWNLOAD REQUIRED")
    print("=" * 60)
    print("Please download the dataset from:")
    print("https://www.kaggle.com/datasets/harunshimanto/epileptic-seizure-recognition")
    print(f"\nSave the file as: {DATA_PATH}")
    print("=" * 60)
    return False


def generate_synthetic_data():
    """Generate synthetic EEG data for demonstration when real data is unavailable"""
    print("Generating synthetic EEG data for demonstration...")
    
    np.random.seed(42)
    n_samples = 2000
    n_features = 178
    
    # Generate non-seizure data (normal EEG patterns)
    non_seizure = np.random.randn(int(n_samples * 0.8), n_features) * 50
    
    # Generate seizure data (high amplitude, high frequency patterns)
    seizure = np.random.randn(int(n_samples * 0.2), n_features) * 150
    # Add spiky patterns typical of seizures
    for i in range(len(seizure)):
        spike_positions = np.random.choice(n_features, size=20, replace=False)
        seizure[i, spike_positions] += np.random.randn(20) * 200
    
    X = np.vstack([non_seizure, seizure])
    y = np.hstack([np.zeros(len(non_seizure)), np.ones(len(seizure))])
    
    # Shuffle
    indices = np.random.permutation(len(X))
    X = X[indices]
    y = y[indices]
    
    print(f"Generated {len(X)} samples ({int(sum(y))} seizure, {int(len(y) - sum(y))} non-seizure)")
    
    return X, y.astype(int)


def load_and_preprocess_data():
    """Load and preprocess the dataset for binary classification"""
    # First try to download real data
    data_available = download_dataset()
    
    if data_available:
        try:
            print("Loading dataset...")
            df = pd.read_csv(DATA_PATH)
            
            # Drop unnamed index column if present
            if 'Unnamed' in df.columns[0]:
                df = df.drop(df.columns[0], axis=1)
            
            # Extract features (X1 to X178) and target (y)
            X = df.iloc[:, :-1].values
            y = df.iloc[:, -1].values
            
            # Convert to binary classification: 1 = Seizure, 0 = Non-Seizure
            # Original: y=1 is seizure, y=2,3,4,5 are non-seizure
            y_binary = (y == 1).astype(int)
            
            print(f"Dataset shape: {X.shape}")
            print(f"Seizure samples: {np.sum(y_binary)} ({np.mean(y_binary)*100:.1f}%)")
            print(f"Non-seizure samples: {len(y_binary) - np.sum(y_binary)} ({(1-np.mean(y_binary))*100:.1f}%)")
            
            return X, y_binary
        except Exception as e:
            print(f"Error loading real data: {e}")
    
    # Fall back to synthetic data
    return generate_synthetic_data()


def build_model(input_shape):
    """Build the LSTM model architecture"""
    model = Sequential([
        # Reshape input for LSTM (samples, timesteps, features)
        keras.layers.Reshape((input_shape, 1), input_shape=(input_shape,)),
        
        # First LSTM layer
        LSTM(128, return_sequences=True),
        BatchNormalization(),
        Dropout(0.3),
        
        # Second LSTM layer
        LSTM(64, return_sequences=False),
        BatchNormalization(),
        Dropout(0.3),
        
        # Dense layers
        Dense(32, activation='relu'),
        Dropout(0.2),
        Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall()]
    )
    
    return model


def train_model():
    """Main training function"""
    # Load and preprocess data
    X, y = load_and_preprocess_data()
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save scaler
    with open(SCALER_PATH, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"Scaler saved to {SCALER_PATH}")
    
    # Build model
    print("\nBuilding model...")
    model = build_model(X_train_scaled.shape[1])
    model.summary()
    
    # Callbacks
    callbacks = [
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        ModelCheckpoint(
            MODEL_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        )
    ]
    
    # Train model
    print("\nTraining model...")
    history = model.fit(
        X_train_scaled, y_train,
        validation_data=(X_test_scaled, y_test),
        epochs=50,
        batch_size=32,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate model
    print("\nEvaluating model...")
    loss, accuracy, precision, recall = model.evaluate(X_test_scaled, y_test, verbose=0)
    f1_score = 2 * (precision * recall) / (precision + recall + 1e-7)
    
    print(f"\n{'='*50}")
    print("MODEL PERFORMANCE")
    print(f"{'='*50}")
    print(f"Accuracy:  {accuracy*100:.2f}%")
    print(f"Precision: {precision*100:.2f}%")
    print(f"Recall:    {recall*100:.2f}%")
    print(f"F1 Score:  {f1_score*100:.2f}%")
    print(f"{'='*50}")
    
    # Save metrics
    metrics = {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1_score),
        'loss': float(loss)
    }
    with open(METRICS_PATH, 'wb') as f:
        pickle.dump(metrics, f)
    print(f"\nMetrics saved to {METRICS_PATH}")
    print(f"Model saved to {MODEL_PATH}")
    
    return model, metrics


if __name__ == '__main__':
    train_model()
