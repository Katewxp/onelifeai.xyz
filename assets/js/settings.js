// Settings page functionality
const modelSelect = document.getElementById('modelSelect');
const encryptionToggle = document.getElementById('encryptionToggle');
const notificationsToggle = document.getElementById('notificationsToggle');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const clearBtn = document.getElementById('clearBtn');

// Load saved settings
const loadSettings = () => {
    const settings = OneLife.Storage.get('settings', {
        model: 'webgpu',
        encryption: true,
        notifications: false
    });
    
    modelSelect.value = settings.model;
    encryptionToggle.checked = settings.encryption;
    notificationsToggle.checked = settings.notifications;
};

// Save settings
const saveSettings = () => {
    const settings = {
        model: modelSelect.value,
        encryption: encryptionToggle.checked,
        notifications: notificationsToggle.checked
    };
    OneLife.Storage.set('settings', settings);
};

// Event listeners
modelSelect.addEventListener('change', saveSettings);
encryptionToggle.addEventListener('change', saveSettings);
notificationsToggle.addEventListener('change', () => {
    saveSettings();
    if (notificationsToggle.checked) {
        requestNotificationPermission();
    }
});

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

