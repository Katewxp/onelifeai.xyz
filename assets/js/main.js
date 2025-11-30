// OneLife - Main JavaScript
// Local-first AI Life Assistant

// Initialize PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Fade in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .tool-card').forEach(el => {
    observer.observe(el);
});

// Local storage utilities
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    }
};

// IndexedDB utilities for larger data
const DB = {
    db: null,
    init: async () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('OneLifeDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                DB.db = request.result;
                resolve(DB.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Life records store
                if (!db.objectStoreNames.contains('records')) {
                    const recordsStore = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
                    recordsStore.createIndex('type', 'type', { unique: false });
                    recordsStore.createIndex('date', 'date', { unique: false });
                }
                
                // Knowledge base store
                if (!db.objectStoreNames.contains('knowledge')) {
                    const knowledgeStore = db.createObjectStore('knowledge', { keyPath: 'id', autoIncrement: true });
                    knowledgeStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                }
                
                // Vector embeddings store (for future RAG)
                if (!db.objectStoreNames.contains('embeddings')) {
                    db.createObjectStore('embeddings', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    },
    
    addRecord: async (record) => {
        if (!DB.db) await DB.init();
        return new Promise((resolve, reject) => {
            const transaction = DB.db.transaction(['records'], 'readwrite');
            const store = transaction.objectStore('records');
            const request = store.add(record);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    
    getRecords: async (type = null) => {
        if (!DB.db) await DB.init();
        return new Promise((resolve, reject) => {
            const transaction = DB.db.transaction(['records'], 'readonly');
            const store = transaction.objectStore('records');
            const request = type 
                ? store.index('type').getAll(type)
                : store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    
    deleteRecord: async (id) => {
        if (!DB.db) await DB.init();
        return new Promise((resolve, reject) => {
            const transaction = DB.db.transaction(['records'], 'readwrite');
            const store = transaction.objectStore('records');
            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
};

// Initialize DB on load
window.addEventListener('load', () => {
    DB.init().catch(console.error);
});

// Export for use in other modules
window.OneLife = {
    Storage,
    DB
};

