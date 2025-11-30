// Settings page functionality
const gradientParallaxUrl = document.getElementById('gradientParallaxUrl');
const apiKey = document.getElementById('apiKey');
const modelSelect = document.getElementById('modelSelect');
const temperatureSlider = document.getElementById('temperatureSlider');
const temperatureValue = document.getElementById('temperatureValue');
const maxTokens = document.getElementById('maxTokens');
const testConnectionBtn = document.getElementById('testConnectionBtn');
const connectionStatus = document.getElementById('connectionStatus');
const encryptionToggle = document.getElementById('encryptionToggle');
const notificationsToggle = document.getElementById('notificationsToggle');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const clearBtn = document.getElementById('clearBtn');

// Load saved settings
const loadSettings = () => {
    const settings = OneLife.Storage.get('settings', {
        gradientParallaxUrl: 'http://localhost:3001',
        model: 'Qwen/Qwen3-0.6B',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 2048,
        encryption: true,
        notifications: false
    });
    
    if (gradientParallaxUrl) gradientParallaxUrl.value = settings.gradientParallaxUrl || 'http://localhost:3001';
    if (apiKey) apiKey.value = settings.apiKey || '';
    if (modelSelect) modelSelect.value = settings.model || 'Qwen/Qwen3-0.6B';
    if (temperatureSlider) {
        temperatureSlider.value = settings.temperature || 0.7;
        if (temperatureValue) temperatureValue.textContent = settings.temperature || 0.7;
    }
    if (maxTokens) maxTokens.value = settings.maxTokens || 2048;
    if (encryptionToggle) encryptionToggle.checked = settings.encryption !== false;
    if (notificationsToggle) notificationsToggle.checked = settings.notifications === true;
};

// Save settings
const saveSettings = () => {
    const settings = {
        gradientParallaxUrl: gradientParallaxUrl ? gradientParallaxUrl.value : 'http://localhost:3001',
        model: modelSelect ? modelSelect.value : 'Qwen/Qwen3-0.6B',
        apiKey: document.getElementById('apiKey') ? document.getElementById('apiKey').value : '',
        temperature: temperatureSlider ? parseFloat(temperatureSlider.value) : 0.7,
        maxTokens: maxTokens ? parseInt(maxTokens.value) : 2048,
        encryption: encryptionToggle ? encryptionToggle.checked : true,
        notifications: notificationsToggle ? notificationsToggle.checked : false
    };
    OneLife.Storage.set('settings', settings);
};

// Test Gradient Parallax connection
const testConnection = async () => {
    if (!testConnectionBtn || !connectionStatus) return;
    
    testConnectionBtn.disabled = true;
    connectionStatus.textContent = 'Testing connection...';
    connectionStatus.style.color = 'rgba(255, 255, 255, 0.6)';
    
    const url = gradientParallaxUrl ? gradientParallaxUrl.value.trim() : 'http://localhost:3001';
    const model = modelSelect ? modelSelect.value : 'Qwen/Qwen3-0.6B';
    const apiKey = document.getElementById('apiKey') ? document.getElementById('apiKey').value.trim() : '';
    const apiUrl = `${url}/v1/chat/completions`;
    
    if (!url) {
        connectionStatus.textContent = '❌ Please enter API endpoint URL';
        connectionStatus.style.color = '#f5576c';
        testConnectionBtn.disabled = false;
        return;
    }
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'user', content: 'Hello' }
                ],
                max_tokens: 10,
                stream: false
            }),
            signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                connectionStatus.textContent = '✅ Connection successful!';
                connectionStatus.style.color = '#38ef7d';
            } else {
                throw new Error('Unexpected response format');
            }
        } else {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Connection test error:', error);
        let errorMsg = '❌ Connection failed. ';
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMsg += 'Please ensure Gradient Parallax is running at ' + url;
        } else {
            errorMsg += error.message;
        }
        connectionStatus.textContent = errorMsg;
        connectionStatus.style.color = '#f5576c';
    } finally {
        testConnectionBtn.disabled = false;
    }
};

// Event listeners
if (gradientParallaxUrl) {
    gradientParallaxUrl.addEventListener('change', saveSettings);
    gradientParallaxUrl.addEventListener('blur', saveSettings);
}
if (apiKey) {
    apiKey.addEventListener('change', saveSettings);
    apiKey.addEventListener('blur', saveSettings);
}
if (modelSelect) modelSelect.addEventListener('change', saveSettings);
if (temperatureSlider) {
    temperatureSlider.addEventListener('input', (e) => {
        if (temperatureValue) temperatureValue.textContent = e.target.value;
        saveSettings();
    });
}
if (maxTokens) maxTokens.addEventListener('change', saveSettings);
if (testConnectionBtn) testConnectionBtn.addEventListener('click', testConnection);
if (encryptionToggle) encryptionToggle.addEventListener('change', saveSettings);
if (notificationsToggle) {
    notificationsToggle.addEventListener('change', () => {
        saveSettings();
        if (notificationsToggle.checked) {
            requestNotificationPermission();
        }
    });
}

// Export data
exportBtn.addEventListener('click', async () => {
    try {
        const records = await OneLife.DB.getRecords();
        const data = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            records: records
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `onelife-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting data. Please try again.');
    }
});

// Import data
importBtn.addEventListener('click', () => {
    importFile.click();
});

importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!data.records || !Array.isArray(data.records)) {
            throw new Error('Invalid backup file format');
        }
        
        if (!confirm(`This will import ${data.records.length} records. Continue?`)) {
            return;
        }
        
        // Import records
        for (const record of data.records) {
            await OneLife.DB.addRecord(record);
        }
        
        alert(`Successfully imported ${data.records.length} records!`);
        importFile.value = '';
    } catch (error) {
        console.error('Import error:', error);
        alert('Error importing data. Please check the file format.');
    }
});

// Clear all data
clearBtn.addEventListener('click', () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL your data. This cannot be undone!\n\nAre you absolutely sure?')) {
        return;
    }
    
    if (!confirm('Last chance! This will delete everything. Continue?')) {
        return;
    }
    
    // Clear IndexedDB
    if (OneLife.DB.db) {
        const transaction = OneLife.DB.db.transaction(['records', 'knowledge', 'embeddings'], 'readwrite');
        Promise.all([
            new Promise((resolve) => {
                transaction.objectStore('records').clear().onsuccess = resolve;
            }),
            new Promise((resolve) => {
                transaction.objectStore('knowledge').clear().onsuccess = resolve;
            }),
            new Promise((resolve) => {
                transaction.objectStore('embeddings').clear().onsuccess = resolve;
            })
        ]).then(() => {
            alert('All data has been cleared.');
        });
    }
});

// Request notification permission
const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
};

// Initialize
window.addEventListener('load', () => {
    loadSettings();
});

