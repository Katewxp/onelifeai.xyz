// AI Chat functionality with Gradient Parallax integration
// Local-first chat interface

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const chatStatus = document.getElementById('chatStatus');
const showReasoningToggle = document.getElementById('showReasoningToggle');

// Get preference for showing reasoning
const shouldShowReasoning = () => {
    return OneLife.Storage.get('showReasoning', false);
};

// Save preference
const saveReasoningPreference = (show) => {
    OneLife.Storage.set('showReasoning', show);
};

// Gradient Parallax configuration
const GRADIENT_PARALLAX_CONFIG = {
    baseUrl: 'http://localhost:3001', // Default Gradient Parallax local server
    apiEndpoint: '/v1/chat/completions', // Note: /v1/chat/completions (not /api/v1/chat/completions)
    timeout: 30000
};

// Get settings from localStorage
const getSettings = () => {
    return OneLife.Storage.get('settings', {
        gradientParallaxUrl: 'http://localhost:3001',
        model: 'Qwen/Qwen3-0.6B',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 2048
    });
};

// Check if Gradient Parallax service is running
const checkGradientParallaxStatus = async () => {
    const settings = getSettings();
    // Test with a simple API call instead of health endpoint
    const apiUrl = `${settings.gradientParallaxUrl}/v1/chat/completions`;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: settings.model || 'Qwen/Qwen3-0.6B',
                messages: [
                    { role: 'user', content: 'Hello' }
                ],
                max_tokens: 10,
                stream: false
            }),
            signal: AbortSignal.timeout(5000)
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
    const apiUrl = `${settings.gradientParallaxUrl}/v1/chat/completions`;
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Add API key if provided (optional for local models)
    if (settings.apiKey && settings.apiKey.trim()) {
        headers['Authorization'] = `Bearer ${settings.apiKey}`;
    }
    
    // Build context-aware system prompt
    const systemPrompt = `You are a helpful local AI assistant for OneLife, a privacy-first life management app.

Your main tasks:
1. Help users record and organize their life data (expenses, tasks, moods, health, notes)
2. Answer questions about their data
3. Provide insights and summaries
4. Help plan schedules

IMPORTANT INSTRUCTIONS:
- When users mention expenses (e.g., "I spent $35 on lunch today"), respond naturally like: "Got it! I've recorded your $35 lunch expense. Is there anything else you'd like to track?"
- When users mention tasks or reminders, acknowledge and confirm it's been added
- When users mention moods or feelings, respond empathetically and confirm it's been logged
- When users mention health data, acknowledge and confirm it's been tracked
- Keep responses concise (1-2 sentences), friendly, and helpful
- Always confirm when data has been recorded
- Do NOT include any reasoning tags, thinking process, or <think> tags in your response
- Provide ONLY the direct, helpful response to the user

Example good response: "Got it! I've recorded your $35 lunch expense in the Food & Dining category. Anything else you'd like to track today?"`;

    const requestBody = {
        model: settings.model || 'Qwen/Qwen3-0.6B',
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: message
            }
        ],
        temperature: settings.temperature || 0.7,
        max_tokens: settings.maxTokens || 2048,
        stream: false // Use non-streaming for simplicity
    };
    
    console.log('Calling Gradient Parallax API:', apiUrl);
    console.log('Request body:', requestBody);
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    // Handle different response formats
    let content = null;
    
    // Try standard format: choices[0].message.content
    if (data.choices?.[0]?.message?.content) {
        content = data.choices[0].message.content;
    }
    // Try alternative format: choices[0].messages.content (Gradient Parallax format)
    else if (data.choices?.[0]?.messages?.content) {
        content = data.choices[0].messages.content;
    }
    // Try direct messages format
    else if (data.messages?.[0]?.content) {
        content = data.messages[0].content;
    }
    
    if (!content) {
        console.error('Unexpected API response format:', data);
        return 'Sorry, I could not generate a response. The API returned an unexpected format.';
    }
    
    // Extract reasoning and main content
    const reasoningMatch = content.match(/<think>([\s\S]*?)<\/redacted_reasoning>/i) || 
                          content.match(/<think>([\s\S]*?)<\/think>/i);
    
    let reasoning = null;
    let mainContent = content;
    
    if (reasoningMatch) {
        reasoning = reasoningMatch[1].trim();
        // Remove reasoning from main content
        mainContent = content.replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, '')
                            .replace(/<think>[\s\S]*?<\/think>/gi, '')
                            .replace(/<think>/gi, '')
                            .trim();
    } else {
        // Try to find reasoning patterns without tags
        // Some models output reasoning before the main response
        const lines = content.split('\n');
        const reasoningLines = [];
        const mainLines = [];
        let foundMain = false;
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !foundMain && (
                trimmed.toLowerCase().startsWith('okay') ||
                trimmed.toLowerCase().startsWith('the user') ||
                trimmed.toLowerCase().startsWith('i need') ||
                trimmed.toLowerCase().startsWith('so, i should')
            )) {
                reasoningLines.push(line);
            } else {
                foundMain = true;
                mainLines.push(line);
            }
        }
        
        if (reasoningLines.length > 0 && mainLines.length > 0) {
            reasoning = reasoningLines.join('\n').trim();
            mainContent = mainLines.join('\n').trim();
        }
    }
    
    return {
        content: mainContent || content.trim() || 'Sorry, I could not generate a response.',
        reasoning: reasoning
    };
};

// Process message with local AI and data extraction
const processMessage = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Try to call Gradient Parallax first
    let aiResponse = '';
    let aiReasoning = null;
    if (isServiceAvailable) {
        try {
            updateStatus('AI is thinking...', 'checking');
            const response = await callGradientParallax(message);
            aiResponse = response.content;
            aiReasoning = response.reasoning;
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

const addMessage = (text, isUser = false, reasoning = null) => {
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
    
    // Add reasoning if available and user wants to see it
    let fullContent = formattedText;
    if (reasoning && shouldShowReasoning()) {
        const reasoningDiv = document.createElement('div');
        reasoningDiv.className = 'message-reasoning';
        reasoningDiv.innerHTML = `
            <div class="reasoning-header">💭 AI Reasoning Process</div>
            <div class="reasoning-content">${reasoning.split('\n').map(line => `<p>${line}</p>`).join('')}</div>
        `;
        content.innerHTML = formattedText;
        content.appendChild(reasoningDiv);
    } else {
        content.innerHTML = formattedText;
    }
    
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
        addMessage(response.text, false, response.reasoning);
        
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

// Initialize reasoning toggle
if (showReasoningToggle) {
    showReasoningToggle.checked = shouldShowReasoning();
    showReasoningToggle.addEventListener('change', (e) => {
        saveReasoningPreference(e.target.checked);
        // Re-render messages with new preference
        const messages = chatMessages.querySelectorAll('.ai-message');
        messages.forEach(msg => {
            const reasoningDiv = msg.querySelector('.message-reasoning');
            if (reasoningDiv) {
                reasoningDiv.style.display = e.target.checked ? 'block' : 'none';
            }
        });
    });
}

// Initialize on load
window.addEventListener('load', () => {
    initializeService();
    chatInput.focus();
});
