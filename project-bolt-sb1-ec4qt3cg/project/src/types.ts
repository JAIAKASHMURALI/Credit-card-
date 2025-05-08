export interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  voiceSample?: string;
}

export interface ValidationResult {
  isValid: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  messages: string[];
}

export interface VoiceAnalysisResult {
  isReal: boolean;
  confidence: number;
  features: {
    naturalness: number;
    pitch: number;
    rhythm: number;
  };
}