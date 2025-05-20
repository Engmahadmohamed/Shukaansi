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
        // Don't show ads if user has premium
        if (localStorage.getItem('shukaansiPremium') === 'true') {
            return;
        }
        
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
        // Don't show ads if user has premium
        if (localStorage.getItem('shukaansiPremium') === 'true') {
            return;
        }
        
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
        // Don't start interval if user has premium
        if (localStorage.getItem('shukaansiPremium') === 'true') {
            return;
        }
        
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
    // Check premium status first
    const isPremium = checkPremiumStatus();
    
    // Only initialize popup ads if not premium
    if (!isPremium) {
        initializePopupAds();
    }

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

    // Function to check daily question limit
    function checkDailyQuestionLimit() {
        const today = new Date().toDateString();
        const questionData = JSON.parse(localStorage.getItem('dailyQuestions') || '{"date": "", "count": 0}');
        
        // Reset count if it's a new day
        if (questionData.date !== today) {
            questionData.date = today;
            questionData.count = 0;
            localStorage.setItem('dailyQuestions', JSON.stringify(questionData));
        }
        
        return questionData.count;
    }

    // Function to increment question count
    function incrementQuestionCount() {
        const today = new Date().toDateString();
        const questionData = JSON.parse(localStorage.getItem('dailyQuestions') || '{"date": "", "count": 0}');
        
        questionData.date = today;
        questionData.count += 1;
        localStorage.setItem('dailyQuestions', JSON.stringify(questionData));
        
        return questionData.count;
    }

    async function sendToAI(message) {
        const API_KEY = 'AIzaSyAvyYhYVO6gGw_tMuJ7cso5BNZPjm1LCME';
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

        const prompt = `You are Shukaansi, a Somali relationship and love advice AI. 
        Respond in Somali language only. Be helpful, empathetic, and culturally appropriate.
        Keep your response concise and clear.
        User message: ${message}`;

        try {
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                // Return fallback response instead of throwing error
                return getFallbackResponse(message);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('Invalid response format:', data);
                return getFallbackResponse(message);
            }
        } catch (error) {
            console.error('Error in sendToAI:', error);
            return getFallbackResponse(message);
        }
    }

    // Function to provide fallback responses when API is unavailable
    function getFallbackResponse(message) {
        const fallbackResponses = [
            "Waan ka xumahay, hadda waxaa jira caqabad nidaamka. Fadlan isku day mar kale.",
            "Maanta waxaa jira caqabado nidaamka. Fadlan isku day mar kale.",
            "Waxaa jira caqabado nidaamka. Fadlan isku day mar kale.",
            "Waxaa jira caqabado nidaamka. Fadlan isku day mar kale.",
            "Waxaa jira caqabado nidaamka. Fadlan isku day mar kale."
        ];
        
        // Return a random fallback response
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    async function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Check if user has premium
        const isPremium = checkPremiumStatus();
        
        // If not premium, check question limit
        if (!isPremium) {
            const questionCount = checkDailyQuestionLimit();
            if (questionCount >= 5) {
                addMessage('Shukaansi', 'Waxaad horey u isticmaashay 5 su\'aalo maanta. Fadlan iibso Premium si aad u hesho talooyin wanaagsan.', 'ai error');
                return;
            }
        }

        // Disable input and button while processing
        userInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.textContent = '...';

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
            
            // Increment question count for non-premium users
            if (!isPremium) {
                const newCount = incrementQuestionCount();
                if (newCount >= 5) {
                    addMessage('Shukaansi', 'Waxaad horey u isticmaashay 5 su\'aalo maanta. Fadlan iibso Premium si aad u hesho talooyin wanaagsan.', 'ai error');
                }
            }
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

    // Premium Status Management
    function checkPremiumStatus() {
        const premiumData = JSON.parse(localStorage.getItem('shukaansiPremium') || '{"isPremium": false, "paymentDate": null}');
        
        // Check if premium is expired (more than 30 days old)
        if (premiumData.isPremium && premiumData.paymentDate) {
            const paymentDate = new Date(premiumData.paymentDate);
            const currentDate = new Date();
            const daysDiff = Math.floor((currentDate - paymentDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff >= 30) {
                // Premium expired
                setPremiumStatus(false, null);
                return false;
            }
        }
        
        if (premiumData.isPremium) {
            updateToPremiumUI();
            // Hide premium purchase elements
            hidePremiumPurchaseElements();
        }
        return premiumData.isPremium;
    }

    // Hide premium purchase elements
    function hidePremiumPurchaseElements() {
        // Hide premium box if user has active premium
        const premiumBox = document.querySelector('.premium-box');
        if (premiumBox) {
            premiumBox.remove(); // Completely remove the element instead of just hiding it
        }

        // Hide premium banner if exists
        const premiumBanner = document.querySelector('.premium-banner');
        if (premiumBanner) {
            premiumBanner.remove(); // Completely remove the element
        }
    }

    // Show premium purchase elements
    function showPremiumPurchaseElements() {
        const container = document.querySelector('.container');
        const chatCard = document.querySelector('.chat-card');
        
        // Create and insert premium box
        const premiumBox = document.createElement('div');
        premiumBox.className = 'premium-box';
        premiumBox.innerHTML = `
            <div class="premium-header">
                <span class="premium-title">Shukaansi Premium</span>
            </div>
            <button class="premium-btn">Iibso Hadda</button>
            <div class="payment-instructions">
                <div class="payment-amount">$0.75 /bishii</div>
                <div class="evc-instructions">
                    <p>Fadlan lacagta ku dir lambarka EVC Plus:</p>
                    <div class="evc-number">+252616736370</div>
                    <p class="evc-note">Markaad lacagta dirayso, fadlan geli lambarkaaga telefoonka si aan u xaqiijino.</p>
                </div>
                <div class="form-group">
                    <label for="phoneNumber">Lambarkaaga Telefoonka</label>
                    <input type="tel" id="phoneNumber" placeholder="+252 61 234 5678">
                </div>
            </div>
        `;
        
        // Insert before chat card
        if (container && chatCard) {
            container.insertBefore(premiumBox, chatCard);
        }

        // Add event listener after button is created
        addPremiumButtonListener();
    }

    // Update premium UI to show remaining days
    function updateToPremiumUI() {
        const premiumBox = document.querySelector('.premium-box');
        if (!premiumBox) return; // Exit if premium box doesn't exist

        const premiumData = JSON.parse(localStorage.getItem('shukaansiPremium') || '{"isPremium": false, "paymentDate": null}');
        
        if (premiumData.isPremium && premiumData.paymentDate) {
            const paymentDate = new Date(premiumData.paymentDate);
            const currentDate = new Date();
            const daysDiff = Math.floor((currentDate - paymentDate) / (1000 * 60 * 60 * 24));
            const remainingDays = 30 - daysDiff;
            
            premiumBox.innerHTML = `
                <div class="premium-header">
                    <span class="premium-title">Shukaansi Premium</span>
                </div>
                <div class="premium-status">
                    <span class="remaining-days">${remainingDays} maalmood</span>
                    <button class="premium-btn" disabled>La Iibiyay</button>
                </div>
            `;
        } else {
            premiumBox.innerHTML = `
                <div class="premium-header">
                    <span class="premium-title">Shukaansi Premium</span>
                </div>
                <a href="tel:*712*616736370*0*75#" class="premium-btn">Iibso Hadda</a>
                <div class="payment-instructions">
                    <div class="payment-amount">$0.75 /bishii</div>
                    <div class="evc-instructions">
                        <p>Fadlan lacagta ku dir lambarka EVC Plus:</p>
                        <div class="evc-number">+252616736370</div>
                        <p class="evc-note">Markaad lacagta dirayso, fadlan geli lambarkaaga telefoonka si aan u xaqiijino.</p>
                    </div>
                    <div class="form-group">
                        <label for="phoneNumber">Lambarkaaga Telefoonka</label>
                        <input type="tel" id="phoneNumber" placeholder="+252 61 234 5678">
                    </div>
                </div>
            `;
            // Add event listener after button is created dynamically
            addPremiumButtonListener();
        }

        // Enable premium features
        enablePremiumFeatures();
    }

    // Function to add click listener to premium button
    function addPremiumButtonListener() {
        const premiumBtn = document.querySelector('.premium-btn');
        if (!premiumBtn || premiumBtn.dataset.listenerAdded) return; // Exit if button doesn't exist or listener already added

        premiumBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default action of the link
            
            const originalText = premiumBtn.textContent;
            premiumBtn.textContent = 'Fadlan sug...'; // Indicate waiting
            premiumBtn.disabled = true; // Disable button during wait

            // Attempt to open phone app with USSD code
            window.location.href = 'tel:*712*616736370*0*75#';

            // Simulate waiting for payment confirmation
            setTimeout(() => {
                setPremiumStatus(true); // Grant premium after 5 seconds
                premiumBtn.textContent = originalText; // Restore button text
                premiumBtn.disabled = false; // Re-enable button
            }, 5000); // 5000 milliseconds = 5 seconds
        });
        premiumBtn.dataset.listenerAdded = 'true'; // Mark as listener added
    }

    // Update premium status with payment date
    function setPremiumStatus(isPremium, paymentDate = null) {
        const premiumData = {
            isPremium: isPremium,
            paymentDate: paymentDate || new Date().toISOString()
        };
        localStorage.setItem('shukaansiPremium', JSON.stringify(premiumData));
        
        if (isPremium) {
            hidePremiumPurchaseElements();
            // Clear any existing ad intervals
            clearInterval(popupAdInterval);
            clearTimeout(popupAdTimeout);
            // Hide any visible ads
            const popupAd = document.getElementById('popupAd');
            if (popupAd) {
                popupAd.classList.remove('active');
            }
            // Enable premium features
            enablePremiumFeatures();
        } else {
            showPremiumPurchaseElements();
            // Disable premium features
            disablePremiumFeatures();
        }
    }

    // Enable premium features
    function enablePremiumFeatures() {
        // Add premium badge to messages
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.classList.add('premium-active');
        }

        // Update input placeholder
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.placeholder = "Su'aashadaaga ku qor halkan (Premium)";
        }
    }

    // Disable premium features
    function disablePremiumFeatures() {
        // Remove premium badge from messages
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.classList.remove('premium-active');
        }

        // Update input placeholder
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.placeholder = "Su'aashadaaga ku qor halkan";
        }
    }

    // Error Card Functionality
    const errorCard = document.getElementById('errorCard');
    const errorCloseBtn = document.querySelector('.error-close-btn');

    function showError(message) {
        const errorMessage = document.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        errorCard.classList.add('active');
    }

    function hideError() {
        errorCard.classList.remove('active');
    }

    // Close error card when clicking the close button
    errorCloseBtn.addEventListener('click', hideError);

    // Close error card when clicking outside
    errorCard.addEventListener('click', (e) => {
        if (e.target === errorCard) {
            hideError();
        }
    });

    // Handle payment form submission
    if (payBtn) {
        payBtn.addEventListener('click', () => {
            const phoneNumberInput = document.getElementById('phoneNumber');
            if (!phoneNumberInput) return;

            const phoneNumber = phoneNumberInput.value;

            if (!validatePhoneNumber(phoneNumber)) {
                showError('Fadlan geli lambar sax ah oo telefoon ah');
                return;
            }

            // Check if user already has active premium
            const premiumData = JSON.parse(localStorage.getItem('shukaansiPremium') || '{"isPremium": false, "paymentDate": null}');
            if (premiumData.isPremium && premiumData.paymentDate) {
                const paymentDate = new Date(premiumData.paymentDate);
                const currentDate = new Date();
                const daysDiff = Math.floor((currentDate - paymentDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff < 30) {
                    showError('Waxaad horey u heysaa premium oo socda. Fadlan sug 30 maalmood.');
                    return;
                }
            }

            // Show loading state
            payBtn.textContent = 'La xaqiijinayo...';
            payBtn.disabled = true;

            // Simulate payment verification
            setTimeout(() => {
                // Set premium status with current date
                setPremiumStatus(true, new Date().toISOString());
                
                // Show success message
                payBtn.textContent = 'Waad ku mahadsantahay!';
                payBtn.style.backgroundColor = '#4CAF50';
                
                // Close modal and reset form after 2 seconds
                setTimeout(() => {
                    if (paymentModal) {
                        paymentModal.classList.remove('active');
                    }
                    resetPaymentForm();
                    payBtn.textContent = 'Xaqiiji Lacagta';
                    payBtn.disabled = false;
                    payBtn.style.backgroundColor = '';
                }, 2000);
            }, 2000);
        });
    }

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

    // Initialize premium status check on page load
    checkPremiumStatus();

    // Add listener when DOM is loaded
    addPremiumButtonListener(); // Add listener on page load if button exists
});

// Ensure listener is added even if content is added dynamically later
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && (node.classList.contains('premium-box') || node.querySelector('.premium-box'))) {
                    // Find the premium button within the added premium box
                    const premiumBtn = node.querySelector('.premium-btn');
                    if (premiumBtn) {
                        addPremiumButtonListener();
                    }
                }
            });
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// Clean up intervals when page is unloaded
window.addEventListener('beforeunload', function() {
    clearInterval(popupAdInterval);
    clearTimeout(popupAdTimeout);
});
