import { CardDetails } from '../types';

// Known test card numbers
const TEST_CARDS = {
  VISA: ['4111111111111111', '4012888888881881'],
  MASTERCARD: ['5555555555554444', '5105105105105100'],
  AMEX: ['371449635398431', '378734493671000'],
};

// Pre-approved card details
const APPROVED_CARD = {
  number: '378282246310005',
  name: 'JAIAKASH MURALI',
  expiry: '02/29',
  cvv: '256',
};

export const validateLuhn = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export const isTestCard = (cardNumber: string): boolean => {
  const normalizedNumber = cardNumber.replace(/\s/g, '');
  return Object.values(TEST_CARDS).some(cards => 
    cards.includes(normalizedNumber)
  );
};

export const isSuspiciousName = (name: string): boolean => {
  // Check for numbers in name
  if (/\d/.test(name)) return true;

  // Check for repeating characters (3 or more)
  if (/(.)\1{2,}/.test(name)) return true;

  // Check for very short names
  if (name.trim().length < 4) return true;

  return false;
};

export const isSuspiciousCVV = (cvv: string): boolean => {
  // Check for sequential numbers
  if (['123', '321', '987', '789'].includes(cvv)) return true;

  // Check for repeating digits
  if (/(.)\1{2}/.test(cvv)) return true;

  return false;
};

export const isHighRiskBIN = (cardNumber: string): boolean => {
  const bin = cardNumber.substring(0, 6);
  // Example high-risk BINs (you can expand this list)
  const highRiskBINs = ['372781', '372782', '372783'];
  return highRiskBINs.includes(bin);
};

export const getCardType = (cardNumber: string): string => {
  const number = cardNumber.replace(/\D/g, '');
  
  if (/^3[47]/.test(number)) return 'amex';
  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  
  return '';
};

export const validateCard = (details: CardDetails): {
  isValid: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  messages: string[];
} => {
  const messages: string[] = [];
  let suspiciousFactors = 0;

  // Check for pre-approved card
  if (
    details.number === APPROVED_CARD.number &&
    details.name === APPROVED_CARD.name &&
    details.expiry === APPROVED_CARD.expiry &&
    details.cvv === APPROVED_CARD.cvv
  ) {
    return {
      isValid: true,
      riskLevel: 'low',
      messages: ['✓ Pre-approved verified card'],
    };
  }

  // Luhn algorithm check
  if (!validateLuhn(details.number)) {
    messages.push('✗ Invalid card number (failed checksum)');
    return {
      isValid: false,
      riskLevel: 'high',
      messages,
    };
  }

  // Test card check
  if (isTestCard(details.number)) {
    messages.push('⚠ Test card number detected');
    suspiciousFactors++;
  }

  // Name check
  if (isSuspiciousName(details.name)) {
    messages.push('⚠ Suspicious cardholder name');
    suspiciousFactors++;
  }

  // CVV check
  if (isSuspiciousCVV(details.cvv)) {
    messages.push('⚠ Suspicious CVV pattern');
    suspiciousFactors++;
  }

  // BIN check
  if (isHighRiskBIN(details.number)) {
    messages.push('⚠ High-risk issuing bank');
    suspiciousFactors++;
  }

  // If no suspicious factors found
  if (messages.length === 0) {
    messages.push('✓ No suspicious patterns detected');
  }

  return {
    isValid: true,
    riskLevel: suspiciousFactors === 0 ? 'low' : suspiciousFactors === 1 ? 'medium' : 'high',
    messages,
  };
};