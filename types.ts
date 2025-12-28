
export enum PredictionLabel {
  SEIZURE = 'Seizure',
  NON_SEIZURE = 'Non-Seizure',
  UNCERTAIN = 'Uncertain'
}

export interface SeizureClassification {
  isSeizure: boolean;
  type: string;
  onsetType: string | null;
  motorSubtype: string | null;
  awarenessStatus: string | null;
  specificTypes: string[];
  motorTypes: string[];
  nonMotorTypes: string[];
  ilaClassification: string | null;
  description?: string;
  focusLocation?: string;
  urgency?: string;
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
  frequencyAnalysis?: {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  };
  signalMetrics?: {
    snr: number;
    peakFrequency: number;
    spectralCentroid: number;
  };
  findings?: string[];
  riskIndicators?: string[];
  recommendations?: string[];
  seizureClassification?: SeizureClassification;
}

export interface EEGData {
  timestamps: number[];
  values: number[];
  samplingRate: number;
  channel: string;
}
