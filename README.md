# NeuroDetect - EEG Seizure Classifier

An AI-powered EEG analysis system for seizure detection and classification. Built with React + TypeScript frontend and Python Flask backend.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)

---

## Overview

NeuroDetect analyzes EEG (Electroencephalogram) signals to detect and classify seizure activity. It supports both:
- **CSV data**: Raw EEG signal values for feature-based analysis
- **Image uploads**: EEG waveform images analyzed via Google Gemini AI

**⚠️ Research Use Only** - Not intended for medical diagnosis.

---

## Features

- 📊 **Real-time EEG Visualization** - Interactive waveform display
- 🧠 **Seizure Detection** - Heuristic-based classification with confidence scores
- 📈 **Frequency Band Analysis** - Delta, Theta, Alpha, Beta, Gamma breakdown
- 🔬 **Signal Metrics** - SNR, Peak Frequency, Spectral Centroid, Entropy
- 🖼️ **Image Analysis** - AI-powered EEG image interpretation via Gemini
- 📚 **Learning Center** - Comprehensive EEG education module

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| Recharts | Data visualization |

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.8+ | Core runtime |
| Flask | REST API server |
| NumPy | Numerical computation |
| SciPy | Signal processing |
| TensorFlow/Keras | ML model support |
| Google Gemini API | Image analysis |

---

## Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- Google Gemini API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/seizure-EEG-analyser-.git
   cd seizure-EEG-analyser-
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install flask flask-cors numpy scipy tensorflow google-generativeai pillow
   ```

4. **Configure environment variables**
   
   Create `.env.local` in the project root:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

---

## Running the Application

### Start Backend Server
```bash
python app.py
```
The Flask API runs on `http://localhost:5000`

### Start Frontend Dev Server
```bash
npm run dev
```
The React app runs on `http://localhost:5173`

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/analyze/csv` | POST | Analyze CSV signal data |
| `/api/analyze/image` | POST | Analyze EEG image with Gemini |

### CSV Analysis Request
```json
{
  "values": [12.5, -8.3, 15.2, ...],
  "samplingRate": 256,
  "channel": "EEG"
}
```

### CSV Analysis Response
```json
{
  "prediction": "Seizure" | "Non-Seizure",
  "confidence": 85.5,
  "signalQuality": "Good",
  "dominantBand": "Delta",
  "stats": { "mean": 0.5, "std": 125.3, "entropy": 0.65 },
  "frequencyAnalysis": { "delta": 45.2, "theta": 20.1, ... },
  "signalMetrics": { "snr": 12.5, "peakFrequency": 4.2, ... },
  "findings": ["High amplitude activity detected", ...],
  "riskIndicators": ["Elevated delta power", ...],
  "recommendations": ["Clinical correlation recommended", ...],
  "seizureClassification": { "onsetType": "Focal", ... }
}
```

---

## Data Processing Pipeline

### 1. CSV Parsing (Frontend)
```
Raw CSV → Parse columns → Extract numerical values → Send to API
```
- Supports multi-column EEG datasets (e.g., 178-feature format)
- Automatically detects header rows and label columns
- Extracts all numerical signal values from data rows

### 2. Feature Extraction (Backend)
```python
# Statistical features
mean = np.mean(signal)
std = np.std(signal)
max_abs = np.max(np.abs(signal))

# Spectral features
entropy = scipy.stats.entropy(normalized_power_spectrum)
```

### 3. Frequency Band Analysis
| Band | Frequency | Clinical Significance |
|------|-----------|----------------------|
| Delta | 0.5-4 Hz | Deep sleep, brain injury |
| Theta | 4-8 Hz | Drowsiness, memory |
| Alpha | 8-12 Hz | Relaxed awake state |
| Beta | 12-30 Hz | Active thinking |
| Gamma | 30+ Hz | Cognitive processing |

Using FFT (Fast Fourier Transform) to decompose signal into frequency components.

### 4. Signal Metrics
- **SNR (Signal-to-Noise Ratio)**: Signal quality assessment
- **Peak Frequency**: Dominant oscillation frequency
- **Spectral Centroid**: "Center of mass" of frequency spectrum

---

## Classification Algorithm

### Heuristic-Based Classification

The system uses feature thresholds for seizure detection:

```python
# Seizure indicators
is_seizure = (max_abs > 800) or (std > 350)

# Confidence calculation
if is_seizure:
    confidence = 0.85 + (min(std, 500) / 500) * 0.1
else:
    confidence = 0.92 + (1 - min(std, 300) / 300) * 0.05
```

### Classification Criteria
| Indicator | Normal Range | Seizure Indicator |
|-----------|--------------|-------------------|
| Amplitude (max) | < 300 µV | > 800 µV |
| Standard Deviation | < 200 µV | > 350 µV |
| Entropy | 0.4 - 0.8 | < 0.2 (highly regular) |

### Seizure Type Classification (ILAE 2017)
Based on dominant frequency band:
- **Delta dominant** → Generalized / Focal onset
- **Theta dominant** → Temporal lobe involvement
- **Beta/Gamma dominant** → Motor cortex / High-frequency discharge

---

## Image Analysis (Gemini AI)

For EEG image uploads, Google Gemini analyzes:
1. Waveform morphology
2. Frequency patterns
3. Amplitude characteristics
4. Abnormal discharges (spikes, sharp waves)
5. Symmetry between hemispheres

The AI provides structured analysis including seizure classification, clinical findings, and recommendations.

---

## Model Architecture

### LSTM Classifier (Optional)
Located at `model/seizure_classifier.h5`:
- Input: Preprocessed EEG signal segments
- Architecture: LSTM layers for temporal pattern recognition
- Output: Binary classification (Seizure / Non-Seizure)

**Note**: Current implementation primarily uses heuristic classification. LSTM model integration is optional.

---

## Project Structure

```
seizure-EEG-analyser-/
├── App.tsx                 # Main React component
├── PrerequisitesPage.tsx   # Learning center
├── services/
│   └── eegAnalysis.ts      # API client & CSV parser
├── types.ts                # TypeScript interfaces
├── app.py                  # Flask API server
├── inference.py            # Signal processing & classification
├── model/
│   ├── seizure_classifier.h5  # Trained LSTM model
│   └── data.csv            # Sample EEG dataset
└── README.md
```

---

## Sample Data Format

The system supports the UCI Epileptic Seizure Recognition Dataset format:
- 178 columns (X1-X178): EEG signal values
- 1 label column (y): 1-5 classification

```csv
X1,X2,X3,...,X178,y
135,-190,229,...,55,1
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open a Pull Request

---

## References

- [ILAE 2017 Seizure Classification](https://www.ilae.org/guidelines/definition-and-classification)
- [UCI Epileptic Seizure Recognition Dataset]([https://archive.ics.uci.edu/ml/datasets/Epileptic+Seizure+Recognition](https://archive.ics.uci.edu/dataset/1134/beed:+bangalore+eeg+epilepsy+dataset))
- [EEG Fundamentals - ACNS Guidelines](https://www.acns.org/)

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

**Disclaimer**: This tool is for research and educational purposes only. It is not a substitute for professional medical diagnosis. Always consult qualified healthcare providers for clinical decisions.
