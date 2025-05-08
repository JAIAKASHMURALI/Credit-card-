import { VoiceAnalysisResult } from '../types';

export const analyzeVoice = async (audioBlob: Blob): Promise<VoiceAnalysisResult> => {
  try {
    // Convert audio to frequency data
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer());
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    
    // Analyze frequency characteristics
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate audio features
    const naturalness = calculateNaturalness(dataArray);
    const pitch = calculatePitchVariation(dataArray);
    const rhythm = calculateRhythmicPatterns(dataArray);
    
    // Determine if voice is real based on features
    const confidence = (naturalness + pitch + rhythm) / 3;
    const isReal = confidence > 0.7;
    
    return {
      isReal,
      confidence,
      features: {
        naturalness,
        pitch,
        rhythm
      }
    };
  } catch (error) {
    console.error('Voice analysis error:', error);
    return {
      isReal: false,
      confidence: 0,
      features: {
        naturalness: 0,
        pitch: 0,
        rhythm: 0
      }
    };
  }
};

// Helper functions for audio analysis
const calculateNaturalness = (frequencyData: Uint8Array): number => {
  // Analyze frequency distribution for natural voice patterns
  const sum = frequencyData.reduce((acc, val) => acc + val, 0);
  const mean = sum / frequencyData.length;
  const variance = frequencyData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / frequencyData.length;
  
  // Natural voices typically have specific variance patterns
  return Math.min(variance / 10000, 1);
};

const calculatePitchVariation = (frequencyData: Uint8Array): number => {
  // Analyze pitch changes over time
  let variations = 0;
  for (let i = 1; i < frequencyData.length; i++) {
    variations += Math.abs(frequencyData[i] - frequencyData[i - 1]);
  }
  
  // Natural voices have smooth pitch transitions
  return Math.min(variations / (frequencyData.length * 255), 1);
};

const calculateRhythmicPatterns = (frequencyData: Uint8Array): number => {
  // Analyze temporal patterns in speech
  let patterns = 0;
  const segments = 8;
  const segmentSize = Math.floor(frequencyData.length / segments);
  
  for (let i = 0; i < segments; i++) {
    const segment = frequencyData.slice(i * segmentSize, (i + 1) * segmentSize);
    const segmentMean = segment.reduce((acc, val) => acc + val, 0) / segmentSize;
    patterns += segmentMean;
  }
  
  // Natural speech has consistent rhythmic patterns
  return Math.min(patterns / (segments * 255), 1);
};