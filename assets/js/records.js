// Records page functionality
const recordsList = document.getElementById('recordsList');
const tabButtons = document.querySelectorAll('.tab-btn');
let currentTab = 'all';

// Load and display records
const loadRecords = async (type = null) => {
    try {
        const records = await OneLife.DB.getRecords(type);
        displayRecords(records);
    } catch (error) {
        console.error('Error loading records:', error);
        recordsList.innerHTML = '<div class="empty-state"><p>Error loading records. Please try again.</p></div>';
    }
};

const displayRecords = (records) => {
    if (!records || records.length === 0) {
        recordsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>No records yet</h3>
                <p>Start chatting with AI to record your life events.</p>
                <a href="/ai/chat" class="btn-primary">Start Recording</a>
            </div>
        `;
        return;
    }

    // Sort by date (newest first)
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    recordsList.innerHTML = records.map(record => {
        return createRecordHTML(record);
    }).join('');
};

const createRecordHTML = (record) => {
    const date = new Date(record.date);
    const dateStr = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let typeIcon = '📝';
    let typeName = 'Note';
    let typeClass = 'record-note';

    switch (record.type) {
        case 'expense':
            typeIcon = '💰';
            typeName = 'Expense';
            typeClass = 'record-expense';
            break;
        case 'todo':
            typeIcon = '📅';
            typeName = 'Todo';
            typeClass = 'record-todo';
            break;
        case 'mood':
            typeIcon = '😊';
            typeName = 'Mood';
            typeClass = 'record-mood';
            break;
        case 'health':
            typeIcon = '💪';
            typeName = 'Health';
            typeClass = 'record-health';
            break;
    }

    let contentHTML = '';
    let metaHTML = '';

    if (record.type === 'expense') {
        contentHTML = `<p><strong>$${record.amount}</strong> - ${record.description || 'Expense'}</p>`;
        metaHTML = `<span class="record-tag">${record.category || 'Uncategorized'}</span>`;
    } else if (record.type === 'todo') {
        contentHTML = `<p>${record.description}</p>`;
        metaHTML = `<span class="record-tag">${record.completed ? '✅ Completed' : '⏳ Pending'}</span>`;
    } else if (record.type === 'mood') {
        contentHTML = `<p>${record.description || 'Mood logged'}</p>`;
        metaHTML = `<span class="record-tag">${record.mood || 'Neutral'}</span>`;
    } else {
        contentHTML = `<p>${record.description || 'No description'}</p>`;
    }

    return `
        <div class="record-item ${typeClass}" data-record-id="${record.id}">
            <div class="record-header">
                <div class="record-type">
                    <span>${typeIcon}</span>
                    <span>${typeName}</span>
                </div>
                <div class="record-actions">
                    <div class="record-date">${dateStr}</div>
                    <button class="delete-btn" data-record-id="${record.id}" title="Delete record">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="record-content">
                ${contentHTML}
            </div>
            ${metaHTML ? `<div class="record-meta">${metaHTML}</div>` : ''}
        </div>
    `;
};

// Map tab names to record types
const tabToTypeMap = {
    'all': null,
    'expenses': 'expense',
    'todos': 'todo',
    'mood': 'mood',
    'health': 'health',
    'notes': 'note'
};

// Tab switching
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active state
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update current tab
        currentTab = btn.dataset.tab;
        
        // Load records with correct type mapping
        const type = tabToTypeMap[currentTab] || null;
        loadRecords(type);
    });
});

// Delete record
const deleteRecord = async (id) => {
    if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
        return;
    }
    
    try {
        await OneLife.DB.deleteRecord(id);
        // Remove from UI immediately
        const recordItem = document.querySelector(`[data-record-id="${id}"]`);
        if (recordItem) {
            recordItem.style.opacity = '0';
            recordItem.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                // Reload records to update the list
                const type = currentTab === 'all' ? null : currentTab;
                loadRecords(type);
            }, 300);
        }
    } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record. Please try again.');
    }
};

// Handle delete button clicks (event delegation)
recordsList.addEventListener('click', (e) => {
    if (e.target.closest('.delete-btn')) {
        const btn = e.target.closest('.delete-btn');
        const recordId = parseInt(btn.dataset.recordId);
        if (recordId) {
            deleteRecord(recordId);
        }
    }
});

// Initial load
window.addEventListener('load', () => {
    loadRecords();
});

