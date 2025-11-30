// Settings page functionality
const gradientParallaxUrl = document.getElementById('gradientParallaxUrl');
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
        gradientParallaxUrl: 'http://localhost:5000',
        model: 'llama-3.1-8b-instruct',
        temperature: 0.7,
        maxTokens: 1000,
        encryption: true,
        notifications: false
    });
    
    if (gradientParallaxUrl) gradientParallaxUrl.value = settings.gradientParallaxUrl;
    if (modelSelect) modelSelect.value = settings.model;
    if (temperatureSlider) {
        temperatureSlider.value = settings.temperature;
        if (temperatureValue) temperatureValue.textContent = settings.temperature;
    }
    if (maxTokens) maxTokens.value = settings.maxTokens;
    if (encryptionToggle) encryptionToggle.checked = settings.encryption;
    if (notificationsToggle) notificationsToggle.checked = settings.notifications;
};

// Save settings
const saveSettings = () => {
    const settings = {
        gradientParallaxUrl: gradientParallaxUrl ? gradientParallaxUrl.value : 'http://localhost:5000',
        model: modelSelect ? modelSelect.value : 'llama-3.1-8b-instruct',
        temperature: temperatureSlider ? parseFloat(temperatureSlider.value) : 0.7,
        maxTokens: maxTokens ? parseInt(maxTokens.value) : 1000,
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
    
    const url = gradientParallaxUrl.value || 'http://localhost:5000';
    const healthUrl = `${url}/health`;
    
    try {
        const response = await fetch(healthUrl, {
            method: 'GET',
            mode: 'cors',
            signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
            connectionStatus.textContent = '✅ Connected successfully!';
            connectionStatus.style.color = '#38ef7d';
        } else {
            throw new Error('Service returned error');
        }
    } catch (error) {
        connectionStatus.textContent = '❌ Connection failed. Please ensure Gradient Parallax is running.';
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

