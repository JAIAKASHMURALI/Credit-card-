document.addEventListener('DOMContentLoaded', function() {
    const cardNumberInput = document.getElementById('card-number');
    const cardHolderInput = document.getElementById('card-holder');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');
    const cardForm = document.getElementById('card-form');
    const resultDiv = document.getElementById('result');
    const resultMessage = document.getElementById('result-message');
    const riskLevel = document.getElementById('risk-level');
    const recommendation = document.getElementById('recommendation');
    const displayCardNumber = document.getElementById('display-card-number');
    const displayCardHolder = document.getElementById('display-card-holder');
    const displayCardExpiry = document.getElementById('display-card-expiry');
    const cardTypeDiv = document.getElementById('card-type');

    // Format card number with spaces
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '');
        if (value.length > 0) {
            value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
        }
        e.target.value = value;
        displayCardNumber.textContent = value || '•••• •••• •••• ••••';
        
        // Detect card type
        detectCardType(value.replace(/\s/g, ''));
    });

    // Update card holder display
    cardHolderInput.addEventListener('input', function(e) {
        displayCardHolder.textContent = e.target.value || 'YOUR NAME';
    });

    // Format expiry date
    expiryDateInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
        displayCardExpiry.textContent = value || 'MM/YY';
    });

    // Form submission
    cardForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get all input values
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');
        const cardHolder = cardHolderInput.value.trim().toUpperCase();
        const expiryDate = expiryDateInput.value;
        const cvv = cvvInput.value;
        
        // Check for the specific legitimate card
        if (cardNumber === '378282246310005' && 
            cardHolder === 'JAIAKASH MURALI' && 
            expiryDate === '02/29' && 
            cvv === '256') {
            showResult('Verified legitimate card', 'low-risk', 'This is a known valid card. Transaction approved.', []);
            return;
        }
        
        // Validate inputs
        if (!validateCardNumber(cardNumber)) {
            showResult('Invalid card number', 'high-risk', 'Please check your card number and try again.', ['Invalid card number format']);
            return;
        }
        
        if (!validateExpiryDate(expiryDate)) {
            showResult('Invalid expiry date', 'high-risk', 'Please check your expiry date and try again.', ['Invalid or expired card date']);
            return;
        }
        
        if (!validateCVV(cvv)) {
            showResult('Invalid CVV', 'high-risk', 'Please check your CVV and try again.', ['Invalid CVV format']);
            return;
        }
        
        // Simulate fraud detection
        detectFraud(cardNumber, expiryDate, cardHolder, cvv);
    });

    // Detect card type based on number
    function detectCardType(cardNumber) {
        cardTypeDiv.className = 'card-type';
        
        if (/^4/.test(cardNumber)) {
            cardTypeDiv.classList.add('visa');
        } else if (/^5[1-5]/.test(cardNumber)) {
            cardTypeDiv.classList.add('mastercard');
        } else if (/^3[47]/.test(cardNumber)) {
            cardTypeDiv.classList.add('amex');
        }
    }

    // Validate card number using Luhn algorithm
    function validateCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleaned)) return false;
        
        let sum = 0;
        let alternate = false;
        
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned.charAt(i), 10);
            
            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit = (digit % 10) + 1;
                }
            }
            
            sum += digit;
            alternate = !alternate;
        }
        
        return sum % 10 === 0;
    }

    // Validate expiry date
    function validateExpiryDate(expiry) {
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
        
        const [month, year] = expiry.split('/').map(Number);
        if (month < 1 || month > 12) return false;
        
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        
        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;
        
        return true;
    }

    // Validate CVV
    function validateCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    // Simulate fraud detection
    function detectFraud(cardNumber, expiryDate, cardHolder, cvv) {
        const riskFactors = [];
        
        // Check for known test numbers (excluding our specific legitimate card)
        if (isTestCard(cardNumber) && cardNumber !== '378282246310005') {
            riskFactors.push('Test card number detected');
        }
        
        // Check if card is expired
        if (!validateExpiryDate(expiryDate)) {
            riskFactors.push('Card is expired');
        }
        
        // Check for suspicious patterns
        if (hasRepeatingDigits(cardNumber)) {
            riskFactors.push('Suspicious card number pattern');
        }
        
        // Check if card is from high-risk BIN
        if (isHighRiskBIN(cardNumber)) {
            riskFactors.push('High-risk card issuer');
        }
        
        // Check for suspicious name patterns
        if (isSuspiciousName(cardHolder)) {
            riskFactors.push('Suspicious cardholder name');
        }
        
        // Check for suspicious CVV patterns
        if (isSuspiciousCVV(cvv)) {
            riskFactors.push('Suspicious CVV pattern');
        }
        
        // Determine risk level
        let riskLevel, message, recommendationText;
        
        if (riskFactors.length === 0) {
            riskLevel = 'low-risk';
            message = 'No signs of fraud detected';
            recommendationText = 'This transaction appears safe.';
        } else if (riskFactors.length === 1) {
            riskLevel = 'medium-risk';
            message = 'Potential fraud risk detected';
            recommendationText = 'Proceed with caution. Consider additional verification.';
        } else {
            riskLevel = 'high-risk';
            message = 'High fraud risk detected';
            recommendationText = 'We recommend declining this transaction or requesting an alternative payment method.';
        }
        
        showResult(message, riskLevel, recommendationText, riskFactors);
    }

    // Helper functions for fraud detection
    function isTestCard(cardNumber) {
        const testCards = [
            '4111111111111111', // Visa test
            '5555555555554444', // Mastercard test
            '378282246310005',  // Amex test
            '6011111111111117'   // Discover test
        ];
        return testCards.includes(cardNumber);
    }

    function hasRepeatingDigits(cardNumber) {
        // Simple check for 4+ repeating digits
        return (/(\d)\1{3,}/.test(cardNumber));
    }

    function isHighRiskBIN(cardNumber) {
        // Simple simulation - check first 6 digits against "high risk" BINs
        const highRiskBINs = ['412345', '512345', '601134'];
        return highRiskBINs.some(bin => cardNumber.startsWith(bin));
    }

    function isSuspiciousName(name) {
        // Simple check for suspicious patterns in names
        return name.length < 3 || 
               /[0-9]/.test(name) || 
               /(.)\1{3,}/.test(name); // 4+ repeating characters
    }

    function isSuspiciousCVV(cvv) {
        // Simple check for suspicious CVV patterns
        return /(.)\1{2}/.test(cvv) || // All digits same
               /123|234|345|456|567|678|789/.test(cvv) || // Sequential
               /987|876|765|654|543|432|321/.test(cvv);
    }

    // Display results
    function showResult(message, riskClass, recommendationText, riskFactors = []) {
        // Clear previous results
        resultMessage.textContent = message;
        riskLevel.textContent = riskClass === 'low-risk' ? 'Low Risk' : 
                              riskClass === 'medium-risk' ? 'Medium Risk' : 'High Risk';
        riskLevel.className = riskClass;
        recommendation.textContent = recommendationText;
        
        // Clear previous risk factors
        const oldList = resultDiv.querySelector('ul');
        if (oldList) oldList.remove();
        
        // Add risk factors if any
        if (riskFactors.length > 0) {
            const factorsList = document.createElement('ul');
            riskFactors.forEach(factor => {
                const item = document.createElement('li');
                item.textContent = factor;
                factorsList.appendChild(item);
            });
            resultDiv.appendChild(factorsList);
        }
        
        resultDiv.style.display = 'block';
    }
});