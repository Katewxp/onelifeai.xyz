// AI Chat functionality
// Local-first chat interface

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const chatStatus = document.getElementById('chatStatus');

// Simple local AI response (placeholder for actual LLM integration)
const processMessage = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Expense detection
    if (lowerMessage.match(/(spent|bought|paid|cost|expense).*\$?(\d+)/)) {
        const amount = message.match(/\$?(\d+)/)?.[1] || message.match(/(\d+)/)?.[1];
        const category = detectCategory(message);
        
        // Save to records
        const record = {
            type: 'expense',
            amount: parseFloat(amount),
            category: category,
            description: message,
            date: new Date().toISOString()
        };
        
        await OneLife.DB.addRecord(record);
        
        return {
            text: `✅ Expense recorded: $${amount} (${category})\n\nAdded to your monthly report.`,
            action: 'expense_recorded',
            data: record
        };
    }
    
    // Todo/Reminder detection
    if (lowerMessage.match(/(remind|todo|task|schedule|appointment).*(tomorrow|today|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)) {
        const record = {
            type: 'todo',
            description: message,
            date: new Date().toISOString(),
            completed: false
        };
        
        await OneLife.DB.addRecord(record);
        
        return {
            text: `📅 Task added to your calendar. I'll remind you when it's time.`,
            action: 'todo_added',
            data: record
        };
    }
    
    // Mood detection
    if (lowerMessage.match(/(feel|mood|feeling|happy|sad|excited|tired|stressed)/i)) {
        const mood = detectMood(message);
        const record = {
            type: 'mood',
            mood: mood,
            description: message,
            date: new Date().toISOString()
        };
        
        await OneLife.DB.addRecord(record);
        
        return {
            text: `😊 Mood logged: ${mood}\n\nI've recorded this in your life journal.`,
            action: 'mood_logged',
            data: record
        };
    }
    
    // Health data
    if (lowerMessage.match(/(walked|steps|exercise|workout|drank|water|slept|hours)/i)) {
        const record = {
            type: 'health',
            description: message,
            date: new Date().toISOString()
        };
        
        await OneLife.DB.addRecord(record);
        
        return {
            text: `💪 Health data recorded. Keep tracking your progress!`,
            action: 'health_recorded',
            data: record
        };
    }
    
    // Default response
    return {
        text: `I understand: "${message}"\n\nI can help you record expenses, schedule tasks, log moods, track health, and more. Just tell me what you did or what you need!`,
        action: 'general_response'
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
    
    // Format text with line breaks
    const formattedText = text.split('\n').map(line => {
        if (line.trim() === '') return '<br>';
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
    
    // Add user message
    addMessage(message, true);
    chatInput.value = '';
    
    // Show typing indicator
    showTyping();
    
    // Process message (simulate delay for better UX)
    setTimeout(async () => {
        hideTyping();
        const response = await processMessage(message);
        addMessage(response.text, false);
    }, 500);
};

// Event listeners
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Focus input on load
chatInput.focus();

