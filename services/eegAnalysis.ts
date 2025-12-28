
import { EEGData, EEGAnalysisResult, PredictionLabel } from '../types';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Analyzes an EEG image using the Python backend (Gemini AI).
 */
export const analyzeEEGImage = async (base64Image: string): Promise<EEGAnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Image analysis failed');
  }

  const data = await response.json();
  console.log('Gemini API Response:', data);

  return {
    prediction: data.prediction === 'Seizure' ? PredictionLabel.SEIZURE : PredictionLabel.NON_SEIZURE,
    confidence: data.confidence,
    signalQuality: data.signalQuality,
    dominantBand: data.dominantBand,
    inferenceTimeMs: data.inferenceTimeMs,
    stats: {
      mean: data.stats.mean,
      std: data.stats.std,
      entropy: data.stats.entropy,
    },
    frequencyAnalysis: data.frequencyAnalysis,
    signalMetrics: data.signalMetrics,
    findings: data.findings,
    riskIndicators: data.riskIndicators,
    recommendations: data.recommendations,
    seizureClassification: data.seizureClassification,
  };
};

/**
 * Analyzes EEG signal from CSV numerical data using the Python backend.
 */
export const analyzeEEGSignal = async (data: EEGData): Promise<EEGAnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze/csv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: data.values,
      samplingRate: data.samplingRate,
      channel: data.channel,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'CSV analysis failed');
  }

  const result = await response.json();
  console.log('CSV Analysis Response:', result);

  return {
    prediction: result.prediction === 'Seizure' ? PredictionLabel.SEIZURE : PredictionLabel.NON_SEIZURE,
    confidence: result.confidence,
    signalQuality: result.signalQuality,
    dominantBand: result.dominantBand,
    inferenceTimeMs: result.inferenceTimeMs,
    stats: {
      mean: result.stats.mean,
      std: result.stats.std,
      entropy: result.stats.entropy,
    },
    frequencyAnalysis: result.frequencyAnalysis,
    signalMetrics: result.signalMetrics,
    findings: result.findings,
    riskIndicators: result.riskIndicators,
    recommendations: result.recommendations,
    seizureClassification: result.seizureClassification,
  };
};

export const parseCSV = (content: string): EEGData => {
  const lines = content.trim().split('\n');
  const values: number[] = [];
  const timestamps: number[] = [];

  lines.forEach((line, index) => {
    const parts = line.split(',');
    const val = parseFloat(parts[0]);
    if (!isNaN(val)) {
      values.push(val);
      timestamps.push(index / 256);
    }
  });

  return {
    values,
    timestamps,
    samplingRate: 256,
    channel: 'FP1-F7'
  };
};
