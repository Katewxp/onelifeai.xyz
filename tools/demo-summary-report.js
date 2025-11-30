// ============================================
// OneLife AI Chat - Summary Report Demo Script
// ============================================
// This script demonstrates how to use the AI Chat summary and report features
// Run this in the browser console after loading the AI Chat page

(async function() {
    console.log('🚀 OneLife AI Chat - Summary Report Demo');
    console.log('==========================================\n');

    // Wait for OneLife to be available
    if (typeof OneLife === 'undefined') {
        console.error('❌ OneLife is not loaded. Please run this on the AI Chat page.');
        return;
    }

    // Initialize database
    await OneLife.DB.init();
    console.log('✅ Database initialized\n');

    // ============================================
    // Step 1: Create Sample Data
    // ============================================
    console.log('📝 Step 1: Creating sample data...\n');

    const sampleExpenses = [
        { type: 'expense', amount: 35, category: 'Food & Dining', description: 'Lunch at restaurant', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 12, category: 'Food & Dining', description: 'Coffee', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 45, category: 'Food & Dining', description: 'Dinner', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 25, category: 'Transportation', description: 'Uber ride', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 80, category: 'Shopping', description: 'Online purchase', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 15, category: 'Food & Dining', description: 'Breakfast', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 120, category: 'Bills & Utilities', description: 'Electricity bill', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 30, category: 'Entertainment', description: 'Movie tickets', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    const sampleMoods = [
        { type: 'mood', mood: 'Happy', description: 'Feeling great today!', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'mood', mood: 'Calm', description: 'Peaceful morning', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'mood', mood: 'Happy', description: 'Had a good day', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'mood', mood: 'Tired', description: 'Long day at work', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'mood', mood: 'Stressed', description: 'Too much to do', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'mood', mood: 'Happy', description: 'Weekend vibes', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    const sampleTodos = [
        { type: 'todo', description: 'Call dentist', completed: false, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'todo', description: 'Buy groceries', completed: true, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'todo', description: 'Finish project', completed: false, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'todo', description: 'Exercise', completed: true, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    const sampleHealth = [
        { type: 'health', description: 'Walked 10,000 steps', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'health', description: 'Drank 8 glasses of water', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'health', description: 'Ran 5km', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'health', description: 'Slept 7 hours', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    // Add all sample data
    for (const expense of sampleExpenses) {
        await OneLife.DB.addRecord(expense);
    }
    console.log(`✅ Added ${sampleExpenses.length} expense records`);

    for (const mood of sampleMoods) {
        await OneLife.DB.addRecord(mood);
    }
    console.log(`✅ Added ${sampleMoods.length} mood records`);

    for (const todo of sampleTodos) {
        await OneLife.DB.addRecord(todo);
    }
    console.log(`✅ Added ${sampleTodos.length} todo records`);

    for (const health of sampleHealth) {
        await OneLife.DB.addRecord(health);
    }
    console.log(`✅ Added ${sampleHealth.length} health records\n`);

    // ============================================
    // Step 2: Demo Query Functions
    // ============================================
    console.log('🔍 Step 2: Demo query functions\n');

    // Function to simulate AI Chat summary request
    const demoSummaryRequest = async (query, description) => {
        console.log(`\n📊 Query: "${query}"`);
        console.log(`   Description: ${description}`);
        console.log('   ---');

        // Simulate the isSummaryRequest check
        const lower = query.toLowerCase();
        const summaryKeywords = [
            'summary', 'summarize', 'report', 'analyze', 'analysis',
            'show me', 'tell me about', 'how much', 'what did i',
            'monthly', 'weekly', 'daily', 'this month', 'this week',
            'expenses', 'spending', 'mood', 'health', 'todos',
            'trend', 'insight', 'overview', 'recap'
        ];
        const isSummary = summaryKeywords.some(keyword => lower.includes(keyword));

        if (!isSummary) {
            console.log('   ⚠️  Not detected as summary request');
            return;
        }

        // Determine record type
        let type = null;
        if (lower.includes('expense') || lower.includes('spending') || lower.includes('spent')) {
            type = 'expense';
        } else if (lower.includes('mood') || lower.includes('feeling')) {
            type = 'mood';
        } else if (lower.includes('health') || lower.includes('exercise') || lower.includes('workout')) {
            type = 'health';
        } else if (lower.includes('todo') || lower.includes('task')) {
            type = 'todo';
        }

        // Determine time range
        const now = new Date();
        let timeRange = 'all';
        let cutoffDate = null;

        if (lower.includes('today')) {
            timeRange = 'today';
            cutoffDate = new Date();
            cutoffDate.setHours(0, 0, 0, 0);
        } else if (lower.includes('this week') || lower.includes('week')) {
            timeRange = 'week';
            cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);
        } else if (lower.includes('this month') || lower.includes('month')) {
            timeRange = 'month';
            cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        }

        // Get records
        const allRecords = await OneLife.DB.getRecords(type);
        let filteredRecords = allRecords;

        if (cutoffDate) {
            filteredRecords = allRecords.filter(record => new Date(record.date) >= cutoffDate);
        }

        console.log(`   📈 Found ${filteredRecords.length} records`);
        console.log(`   📅 Time range: ${timeRange}`);
        console.log(`   🏷️  Type filter: ${type || 'all'}`);

        // Format records for display
        if (filteredRecords.length > 0) {
            const grouped = {};
            filteredRecords.forEach(record => {
                if (!grouped[record.type]) {
                    grouped[record.type] = [];
                }
                grouped[record.type].push(record);
            });

            Object.keys(grouped).forEach(type => {
                const typeRecords = grouped[type];
                console.log(`\n   ${type.toUpperCase()} (${typeRecords.length}):`);
                
                typeRecords.slice(0, 5).forEach(record => {
                    const date = new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    if (type === 'expense') {
                        console.log(`      • ${date}: $${record.amount} - ${record.category}`);
                    } else if (type === 'mood') {
                        console.log(`      • ${date}: ${record.mood} - ${record.description.substring(0, 30)}`);
                    } else if (type === 'todo') {
                        console.log(`      • ${date}: ${record.completed ? '✅' : '⏳'} ${record.description}`);
                    } else {
                        console.log(`      • ${date}: ${record.description.substring(0, 40)}`);
                    }
                });
                
                if (typeRecords.length > 5) {
                    console.log(`      ... and ${typeRecords.length - 5} more`);
                }
            });

            // Calculate statistics
            const expenses = grouped['expense'] || [];
            if (expenses.length > 0) {
                const total = expenses.reduce((sum, r) => sum + (r.amount || 0), 0);
                const avg = total / expenses.length;
                const byCategory = {};
                expenses.forEach(e => {
                    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
                });
                
                console.log(`\n   💰 Expense Statistics:`);
                console.log(`      Total: $${total.toFixed(2)}`);
                console.log(`      Average: $${avg.toFixed(2)}`);
                console.log(`      By Category:`);
                Object.entries(byCategory).forEach(([cat, amt]) => {
                    console.log(`        ${cat}: $${amt.toFixed(2)}`);
                });
            }

            const moods = grouped['mood'] || [];
            if (moods.length > 0) {
                const moodCounts = {};
                moods.forEach(m => {
                    const mood = m.mood || 'Neutral';
                    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
                });
                
                console.log(`\n   😊 Mood Statistics:`);
                Object.entries(moodCounts).forEach(([mood, count]) => {
                    const percentage = ((count / moods.length) * 100).toFixed(1);
                    console.log(`      ${mood}: ${count} (${percentage}%)`);
                });
            }

            const todos = grouped['todo'] || [];
            if (todos.length > 0) {
                const completed = todos.filter(t => t.completed).length;
                const pending = todos.length - completed;
                console.log(`\n   📅 Todo Statistics:`);
                console.log(`      Completed: ${completed}`);
                console.log(`      Pending: ${pending}`);
                console.log(`      Completion rate: ${((completed / todos.length) * 100).toFixed(1)}%`);
            }
        } else {
            console.log('   ℹ️  No records found for this query');
        }
    };

    // ============================================
    // Step 3: Run Demo Queries
    // ============================================
    console.log('🎯 Step 3: Running demo queries\n');

    // Demo 1: Monthly expenses
    await demoSummaryRequest(
        'Show me my expenses this month',
        'Get all expenses from the past month with statistics'
    );

    // Demo 2: Weekly mood summary
    await demoSummaryRequest(
        'Summarize my mood this week',
        'Analyze mood trends from the past week'
    );

    // Demo 3: Today's spending
    await demoSummaryRequest(
        'What did I spend today?',
        'Get today\'s expense records'
    );

    // Demo 4: All expenses
    await demoSummaryRequest(
        'Generate a report on my expenses',
        'Comprehensive expense analysis'
    );

    // Demo 5: Todo status
    await demoSummaryRequest(
        'Show me my todos',
        'Display all todo items with completion status'
    );

    // Demo 6: Health data
    await demoSummaryRequest(
        'Analyze my health data',
        'Review health and fitness records'
    );

    // ============================================
    // Step 4: Example AI Chat Messages
    // ============================================
    console.log('\n\n💬 Step 4: Example AI Chat messages you can try\n');
    console.log('Copy and paste these into the AI Chat interface:\n');
    
    const exampleQueries = [
        'Show me my expenses this month',
        'What did I spend today?',
        'Summarize my mood this week',
        'Generate a report on my spending',
        'Tell me about my expenses',
        'Analyze my mood trends',
        'What are my todos?',
        'Show me my health data',
        'How much did I spend on food this week?',
        'What\'s my spending breakdown by category?',
    ];

    exampleQueries.forEach((query, index) => {
        console.log(`${index + 1}. "${query}"`);
    });

    // ============================================
    // Step 5: Cleanup (Optional)
    // ============================================
    console.log('\n\n🧹 Step 5: Cleanup\n');
    console.log('To remove demo data, run:');
    console.log('  const allRecords = await OneLife.DB.getRecords();');
    console.log('  for (const record of allRecords) {');
    console.log('    await OneLife.DB.deleteRecord(record.id);');
    console.log('  }');

    console.log('\n✅ Demo completed!');
    console.log('Now try asking the AI Chat: "Show me my expenses this month"');
})();

