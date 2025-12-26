
export enum PredictionLabel {
  SEIZURE = 'Seizure',
  NON_SEIZURE = 'Non-Seizure',
  UNCERTAIN = 'Uncertain'
}

export interface EEGAnalysisResult {
  prediction: PredictionLabel;
  confidence: number;
  signalQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  dominantBand: 'Delta' | 'Theta' | 'Alpha' | 'Beta' | 'Gamma';
  inferenceTimeMs: number;
  stats: {
    mean: number;
    std: number;
    entropy: number;
  };
}

export interface EEGData {
  timestamps: number[];
  values: number[];
  samplingRate: number;
  channel: string;
}
