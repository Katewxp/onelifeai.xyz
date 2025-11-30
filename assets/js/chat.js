// AI Chat functionality with Gradient Parallax integration
// Local-first chat interface

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const chatStatus = document.getElementById('chatStatus');

// Gradient Parallax configuration
const GRADIENT_PARALLAX_CONFIG = {
    baseUrl: 'http://localhost:3001', // Default Gradient Parallax local server
    apiEndpoint: '/api/v1/chat/completions',
    timeout: 30000
};

// Get settings from localStorage
const getSettings = () => {
    return OneLife.Storage.get('settings', {
        gradientParallaxUrl: 'http://localhost:3001',
        model: 'llama-3.1-8b-instruct',
        temperature: 0.7,
        maxTokens: 1000
    });
};

// Check if Gradient Parallax service is running
const checkGradientParallaxStatus = async () => {
    const settings = getSettings();
    const statusUrl = `${settings.gradientParallaxUrl}/health`;
    
    try {
        const response = await fetch(statusUrl, {
            method: 'GET',
            mode: 'cors',
            signal: AbortSignal.timeout(3000)
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Initialize and check service status
let isServiceAvailable = false;
let serviceCheckAttempted = false;

const initializeService = async () => {
    if (serviceCheckAttempted) return;
    serviceCheckAttempted = true;
    
    updateStatus('Checking local AI service...', 'checking');
    
    isServiceAvailable = await checkGradientParallaxStatus();
    
    if (!isServiceAvailable) {
        updateStatus('Local AI service not available', 'error');
        showServiceWarning();
        return;
    }
    
    updateStatus('Connected to Gradient Parallax', 'connected');
    
    // Update welcome message
    const welcomeMsg = chatMessages.querySelector('.ai-message');
    if (welcomeMsg) {
        welcomeMsg.querySelector('.message-content').innerHTML = `
            <p>Hello! I'm your local AI assistant powered by <strong>Gradient Parallax</strong>.</p>
            <p>I can help you:</p>
            <ul>
                <li>Record expenses, events, and notes</li>
                <li>Answer questions about your life data</li>
                <li>Generate summaries and insights</li>
                <li>Plan your schedule</li>
            </ul>
            <p>Everything we discuss stays on your device. What would you like to do?</p>
        `;
    }
};

// Show warning if service is not available
const showServiceWarning = () => {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'service-warning';
    warningDiv.innerHTML = `
        <div class="warning-content">
            <h3>⚠️ Local AI Service Not Available</h3>
            <p>Please start the Gradient Parallax local AI service to use the AI Chat feature.</p>
            <p><strong>To start the service:</strong></p>
            <ol>
                <li>Install and start Gradient Parallax on your device</li>
                <li>Ensure the service is running on <code>http://localhost:3001</code></li>
                <li>Refresh this page after starting the service</li>
            </ol>
            <p>
                <a href="https://www.gradient.network/" target="_blank" rel="noopener">Learn more about Gradient Parallax →</a>
            </p>
            <button onclick="location.reload()" class="btn-primary" style="margin-top: 15px;">Retry Connection</button>
        </div>
    `;
    chatMessages.appendChild(warningDiv);
};

// Update status indicator
const updateStatus = (text, status) => {
    const indicator = chatStatus.querySelector('.status-indicator');
    const statusText = chatStatus.querySelector('span:last-child');
    
    if (statusText) {
        statusText.textContent = text;
    }
    
    if (indicator) {
        indicator.className = 'status-indicator';
        switch (status) {
            case 'connected':
                indicator.classList.add('local-indicator');
                break;
            case 'checking':
                indicator.classList.add('checking-indicator');
                break;
            case 'error':
                indicator.classList.add('error-indicator');
                break;
            default:
                indicator.classList.add('local-indicator');
        }
    }
};

// Call Gradient Parallax API
const callGradientParallax = async (message) => {
    const settings = getSettings();
    const apiUrl = `${settings.gradientParallaxUrl}${GRADIENT_PARALLAX_CONFIG.apiEndpoint}`;
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: settings.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful local AI assistant for OneLife, a privacy-first life management app. Help users record expenses, manage tasks, track moods, and organize their life data. Always be concise and helpful.'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            stream: false
        })
    });
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
};

// Process message with local AI and data extraction
const processMessage = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Try to call Gradient Parallax first
    let aiResponse = '';
    if (isServiceAvailable) {
        try {
            updateStatus('AI is thinking...', 'checking');
            aiResponse = await callGradientParallax(message);
            updateStatus('Connected to Gradient Parallax', 'connected');
        } catch (error) {
            console.error('Gradient Parallax error:', error);
            isServiceAvailable = false;
            updateStatus('Connection lost. Please restart service.', 'error');
            aiResponse = 'I apologize, but I lost connection to the local AI service. Please ensure Gradient Parallax is running and refresh the page.';
        }
    } else {
        aiResponse = 'Please start the Gradient Parallax local AI service to use this feature.';
    }
    
    // Also extract structured data for local storage
    let structuredData = null;
    
    // Expense detection
    if (lowerMessage.match(/(spent|bought|paid|cost|expense).*\$?(\d+)/)) {
        const amount = message.match(/\$?(\d+)/)?.[1] || message.match(/(\d+)/)?.[1];
        const category = detectCategory(message);
        
        structuredData = {
            type: 'expense',
            amount: parseFloat(amount),
            category: category,
            description: message,
            date: new Date().toISOString()
        };
        
        await OneLife.DB.addRecord(structuredData);
    }
    // Todo/Reminder detection
    else if (lowerMessage.match(/(remind|todo|task|schedule|appointment).*(tomorrow|today|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)) {
        structuredData = {
            type: 'todo',
            description: message,
            date: new Date().toISOString(),
            completed: false
        };
        
        await OneLife.DB.addRecord(structuredData);
    }
    // Mood detection
    else if (lowerMessage.match(/(feel|mood|feeling|happy|sad|excited|tired|stressed)/i)) {
        const mood = detectMood(message);
        structuredData = {
            type: 'mood',
            mood: mood,
            description: message,
            date: new Date().toISOString()
        };
        
        await OneLife.DB.addRecord(structuredData);
    }
    // Health data
    else if (lowerMessage.match(/(walked|steps|exercise|workout|drank|water|slept|hours)/i)) {
        structuredData = {
            type: 'health',
            description: message,
            date: new Date().toISOString()
        };
        
        await OneLife.DB.addRecord(structuredData);
    }
    
    return {
        text: aiResponse,
        structuredData: structuredData
    };
};

const detectCategory = (message) => {
    const lower = message.toLowerCase();
    if (lower.match(/(food|lunch|dinner|breakfast|restaurant|cafe|coffee|eat)/)) return 'Food & Dining';
    if (lower.match(/(transport|uber|taxi|gas|fuel|parking)/)) return 'Transportation';
    if (lower.match(/(shopping|store|buy|purchase|amazon)/)) return 'Shopping';
    if (lower.match(/(entertainment|movie|game|netflix|spotify)/)) return 'Entertainment';
    if (lower.match(/(bill|utility|phone|internet|electricity)/)) return 'Bills & Utilities';
    return 'Other';
};

const detectMood = (message) => {
    const lower = message.toLowerCase();
    if (lower.match(/(happy|great|good|excited|amazing|wonderful)/)) return 'Happy';
    if (lower.match(/(sad|down|depressed|upset|disappointed)/)) return 'Sad';
    if (lower.match(/(tired|exhausted|sleepy|drained)/)) return 'Tired';
    if (lower.match(/(stressed|anxious|worried|nervous)/)) return 'Stressed';
    if (lower.match(/(calm|peaceful|relaxed|content)/)) return 'Calm';
    return 'Neutral';
};

const addMessage = (text, isUser = false) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? '👤' : '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Format text with line breaks and markdown-like formatting
    const formattedText = text.split('\n').map(line => {
        if (line.trim() === '') return '<br>';
        // Convert markdown-style formatting
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        return `<p>${line}</p>`;
    }).join('');
    
    content.innerHTML = formattedText;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const showTyping = () => {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    
    const dots = document.createElement('div');
    dots.style.display = 'flex';
    dots.style.gap = '5px';
    dots.style.padding = '15px 20px';
    dots.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(dots);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const hideTyping = () => {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
};

const sendMessage = async () => {
    const message = chatInput.value.trim();
    if (!message) return;
    
    if (!isServiceAvailable) {
        alert('Please start the Gradient Parallax local AI service first.');
        return;
    }
    
    // Add user message
    addMessage(message, true);
    chatInput.value = '';
    chatInput.disabled = true;
    sendButton.disabled = true;
    
    // Show typing indicator
    showTyping();
    
    try {
        const response = await processMessage(message);
        hideTyping();
        addMessage(response.text, false);
        
        // Show confirmation if data was recorded
        if (response.structuredData) {
            const confirmMsg = response.structuredData.type === 'expense' 
                ? `✅ ${response.structuredData.type} recorded: $${response.structuredData.amount || ''}`
                : `✅ ${response.structuredData.type} recorded`;
            setTimeout(() => {
                addMessage(confirmMsg, false);
            }, 500);
        }
    } catch (error) {
        hideTyping();
        addMessage('Sorry, I encountered an error. Please try again or check your local AI service connection.', false);
        console.error('Error:', error);
    } finally {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
};

// Event listeners
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Initialize on load
window.addEventListener('load', () => {
    initializeService();
    chatInput.focus();
});
