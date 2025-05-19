// Popup Ad Functionality
let popupAdInterval;
let popupAdTimeout;

function initializePopupAds() {
    const popupAd = document.getElementById('popupAd');
    const closePopupAd = document.querySelector('.close-popup-ad');
    const adActionBtn = document.querySelector('.ad-action-btn');

    if (!popupAd || !closePopupAd || !adActionBtn) {
        console.error('Popup ad elements not found');
        return;
    }

    // Show popup ad
    function showPopupAd() {
        if (popupAd) {
            popupAd.classList.add('active');
            // Pause the interval while ad is shown
            clearInterval(popupAdInterval);
        }
    }

    // Hide popup ad
    function hidePopupAd() {
        if (popupAd) {
            popupAd.classList.remove('active');
            // Resume the interval after ad is closed
            startPopupAdInterval();
        }
    }

    // Handle ad button click
    adActionBtn.addEventListener('click', () => {
        // Show rewarded interstitial ad
        show_9315592().then(() => {
            // After ad is watched, show payment modal
            const paymentModal = document.getElementById('paymentModal');
            if (paymentModal) {
                paymentModal.classList.add('active');
            }
            // Hide the popup ad
            hidePopupAd();
        }).catch(error => {
            console.error('Ad error:', error);
            // If ad fails, still show payment modal
            const paymentModal = document.getElementById('paymentModal');
            if (paymentModal) {
                paymentModal.classList.add('active');
            }
            hidePopupAd();
        });
    });

    // Start the popup ad interval
    function startPopupAdInterval() {
        // Clear any existing intervals
        clearInterval(popupAdInterval);
        // Set new interval
        popupAdInterval = setInterval(showPopupAd, 30000);
    }

    // Close popup ad when clicking the close button
    closePopupAd.addEventListener('click', hidePopupAd);

    // Close popup ad when clicking outside
    popupAd.addEventListener('click', (e) => {
        if (e.target === popupAd) {
            hidePopupAd();
        }
    });

    // Start the popup ad system
    startPopupAdInterval();
    
    // Show first popup ad after 30 seconds
    popupAdTimeout = setTimeout(showPopupAd, 30000);
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize popup ads
    initializePopupAds();

    // Chat functionality
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.querySelector('.chat-messages');

    // Add initial AI message
    addMessage('Shukaansi', 'Salaam! Ana Shukaansi, hagaahaaga xiriirrada. Maxaad rabtaa inaad weydiiso?', 'ai');

    // Handle send button click
    sendBtn.addEventListener('click', handleSendMessage);

    // Handle Enter key
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    async function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Disable input and button while processing
        userInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.textContent = 'La diiwaangelinayo...';

        // Add user message
        addMessage('User', message, 'user');
        userInput.value = '';

        // Show loading state
        const loadingId = addMessage('Shukaansi', '...', 'ai loading');

        try {
            const response = await sendToAI(message);
            // Remove loading message
            document.getElementById(loadingId).remove();
            // Add AI response
            addMessage('Shukaansi', response, 'ai');
        } catch (error) {
            console.error('Error:', error);
            // Remove loading message
            document.getElementById(loadingId).remove();
            // Show error message
            addMessage('Shukaansi', 'Waan ka xumahay, fadlan isku day mar kale.', 'ai error');
        } finally {
            // Re-enable input and button
            userInput.disabled = false;
            sendBtn.disabled = false;
            sendBtn.textContent = 'Dir';
            userInput.focus();
        }
    }

    async function sendToAI(message) {
        const API_KEY = 'AIzaSyDcj_X3fJ9iW9OgA3gkyhTBX5z2PVlF12I';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const prompt = `You are Shukaansi, a Somali relationship and love advice AI. 
        Respond in Somali language only. Be helpful, empathetic, and culturally appropriate.
        Keep your response concise and clear.
        User message: ${message}`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error('API request failed');
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error in sendToAI:', error);
            throw error;
        }
    }

    function addMessage(sender, text, type) {
        const messageDiv = document.createElement('div');
        const messageId = 'msg-' + Date.now();
        messageDiv.id = messageId;
        messageDiv.className = `message ${type}`;
        
        messageDiv.innerHTML = `
            <div class="message-sender">${sender}</div>
            <div class="message-text">${text}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageId;
    }

    // Payment Card Functionality
    const paymentModal = document.getElementById('paymentModal');
    const premiumBtn = document.querySelector('.premium-btn');
    const closeBtn = document.querySelector('.close-btn');
    const payBtn = document.querySelector('.pay-btn');

    // Show payment modal
    premiumBtn.addEventListener('click', () => {
        paymentModal.classList.add('active');
    });

    // Close payment modal
    closeBtn.addEventListener('click', () => {
        paymentModal.classList.remove('active');
    });

    // Close modal when clicking outside
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.classList.remove('active');
        }
    });

    // Handle payment form submission
    payBtn.addEventListener('click', () => {
        const phoneNumber = document.getElementById('phoneNumber').value;

        if (!validatePhoneNumber(phoneNumber)) {
            alert('Fadlan geli lambar sax ah oo telefoon ah');
            return;
        }

        // Show loading state
        payBtn.textContent = 'La xaqiijinayo...';
        payBtn.disabled = true;

        // Simulate payment verification
        setTimeout(() => {
            // Simulate successful verification
            payBtn.textContent = 'Waad ku mahadsantahay!';
            payBtn.style.backgroundColor = '#4CAF50';
            
            // Update UI to show premium status
            updateToPremiumUI();
            
            // Close modal and reset form after 2 seconds
            setTimeout(() => {
                paymentModal.classList.remove('active');
                resetPaymentForm();
                payBtn.textContent = 'Xaqiiji Lacagta';
                payBtn.disabled = false;
                payBtn.style.backgroundColor = '';
            }, 2000);
        }, 2000);
    });

    function validatePhoneNumber(phone) {
        // Simple validation for Somali phone numbers
        return /^(\+252|0)?[67]\d{8}$/.test(phone);
    }

    function resetPaymentForm() {
        document.getElementById('phoneNumber').value = '';
    }

    // Format phone number input
    document.getElementById('phoneNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('252')) {
            value = '+' + value;
        } else if (value.startsWith('0')) {
            value = value.substring(1);
        }
        e.target.value = value;
    });

    // Format card number input
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        e.target.value = value.replace(/(\d{4})/g, '$1 ').trim();
    });

    // Format expiry date input
    document.getElementById('expiryDate').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
    });

    function updateToPremiumUI() {
        // Update the premium box to show active subscription
        const premiumBox = document.querySelector('.premium-box');
        premiumBox.innerHTML = `
            <b>Shukaansi Premium</b>
            <p>Waad ku mahadsantahay! Waxaad hadda isticmaali kartaa dhammaan awoodaha Premium.</p>
            <div class="premium-features">
                <p>✓ Hel talooyin gaar ah</p>
                <p>✓ Hel jawaabo dheeraad ah</p>
                <p>✓ Hel hagitaan xiriir</p>
            </div>
        `;
    }
});

// Clean up intervals when page is unloaded
window.addEventListener('beforeunload', function() {
    clearInterval(popupAdInterval);
    clearTimeout(popupAdTimeout);
});
