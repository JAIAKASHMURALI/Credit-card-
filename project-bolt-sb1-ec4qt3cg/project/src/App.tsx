import React, { useState, FormEvent, useEffect } from 'react';
import { CreditCard, Mic } from 'lucide-react';
import { validateCard, getCardType } from './utils/cardValidation';
import { analyzeVoice } from './utils/voiceValidation';
import type { CardDetails, ValidationResult, VoiceAnalysisResult } from './types';

const TEAM_MEMBERS = [
  'JAIAKASH M',
  'SANJAY KUMAR S',
  'JISHNU C',
  'THARUN R',
  'CHANDRU S',
  'ABISHEK V'
];

function App() {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [voiceResult, setVoiceResult] = useState<VoiceAnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cardType, setCardType] = useState<string>('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    console.log(`Fraud Detection System v1.0 - Team ${TEAM_MEMBERS.join(', ')}`);
  }, []);

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    }
    return value;
  };

  const formatExpiry = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = formatCardNumber(value);
      setCardType(getCardType(value));
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    }

    setCardDetails(prev => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const result = await analyzeVoice(blob);
        setVoiceResult(result);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validateCard(cardDetails);
    setValidationResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:py-12 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Credit Card Fraud Detection</h1>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 mb-8">
          <div className="mb-8 relative">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white transform transition-transform duration-300 hover:scale-[1.02] shadow-[0_10px_20px_rgba(0,0,0,0.15)]">
              <div className="flex justify-between items-center mb-4">
                <CreditCard className="w-10 h-10" />
                <div className="absolute top-5 right-5">
                  <div className="w-[60px] h-[40px] bg-white/20 rounded-md backdrop-blur-sm" />
                </div>
              </div>
              <div className="text-2xl mb-6 font-mono tracking-wider">
                {cardDetails.number || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-75 mb-1">Card Holder</div>
                  <div className="font-medium tracking-wide">{cardDetails.name || 'YOUR NAME'}</div>
                </div>
                <div>
                  <div className="text-xs opacity-75 mb-1">Expires</div>
                  <div className="font-medium">{cardDetails.expiry || 'MM/YY'}</div>
                </div>
              </div>
              {cardType && (
                <div className="absolute top-6 right-6 text-sm font-medium uppercase tracking-wider">
                  {cardType}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                name="number"
                value={cardDetails.number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Holder Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="name"
                  value={cardDetails.name}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg"
                  placeholder="John Doe"
                />
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-colors`}
                >
                  <Mic className="w-5 h-5" />
                  {isRecording ? 'Stop' : 'Record'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiry"
                  value={cardDetails.expiry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="password"
                  name="cvv"
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg"
                  placeholder="•••"
                  maxLength={3}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg font-medium"
            >
              Check for Fraud
            </button>
          </form>
        </div>

        {(validationResult || voiceResult) && (
          <div className={`bg-white rounded-lg shadow-lg p-6 ${
            validationResult?.riskLevel === 'low' ? 'border-green-500' :
            validationResult?.riskLevel === 'medium' ? 'border-yellow-500' :
            'border-red-500'
          } border-l-4`}>
            <h2 className="text-xl font-semibold mb-4">Fraud Detection Result</h2>
            
            {validationResult && (
              <div className={`rounded-md p-4 mb-4 ${
                validationResult.riskLevel === 'low' ? 'bg-green-50 text-green-800' :
                validationResult.riskLevel === 'medium' ? 'bg-yellow-50 text-yellow-800' :
                'bg-red-50 text-red-800'
              }`}>
                <div className="font-medium mb-2">
                  Risk Level: {validationResult.riskLevel.toUpperCase()}
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {validationResult.messages.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            {voiceResult && (
              <div className={`rounded-md p-4 ${
                voiceResult.isReal ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <div className="font-medium mb-2">
                  Voice Analysis: {voiceResult.isReal ? 'Authentic' : 'Suspicious'}
                </div>
                <div className="space-y-2">
                  <p>Confidence: {(voiceResult.confidence * 100).toFixed(1)}%</p>
                  <div className="text-sm">
                    <p>Natural Speech: {(voiceResult.features.naturalness * 100).toFixed(1)}%</p>
                    <p>Pitch Variation: {(voiceResult.features.pitch * 100).toFixed(1)}%</p>
                    <p>Rhythmic Pattern: {(voiceResult.features.rhythm * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-auto pt-8 pb-4 text-center">
        <p className="text-sm text-gray-500 font-light">
          Developed by: {TEAM_MEMBERS.join(', ')}
        </p>
      </footer>
    </div>
  );
}

export default App;