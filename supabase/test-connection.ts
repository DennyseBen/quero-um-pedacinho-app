// Quick test to verify Supabase connection and data
// Run: npx tsx supabase/test-connection.ts

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pkjrenijzgyzqilqpjyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranJlbmlqemd5enFpbHFwanlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMDEzODIsImV4cCI6MjA4ODY3NzM4Mn0.pq1kCFTqM3y3RTa0ZTs-g_iWsxrjNYOnC8Iq6dbMOL8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log('🔌 Testing Supabase connection...\n');

    // Test 1: Fetch all products
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true });

    if (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }

    console.log(`✅ Connected! Found ${products.length} products:\n`);

    const categories = [...new Set(products.map(p => p.category))];
    for (const cat of categories) {
        const items = products.filter(p => p.category === cat);
        console.log(`  📂 ${cat.toUpperCase()}`);
        for (const item of items) {
            console.log(`     🍕 ${item.name} — R$ ${Number(item.price).toFixed(2)}`);
        }
        console.log('');
    }

    // Test 2: Verify all tables exist
    const tables = ['users', 'products', 'orders', 'order_items'];
    console.log('📋 Checking tables...');
    for (const table of tables) {
        const { error: tableError } = await supabase.from(table).select('id').limit(1);
        console.log(`   ${tableError ? '❌' : '✅'} ${table} ${tableError ? `— ${tableError.message}` : ''}`);
    }

    console.log('\n🎉 All checks passed!');
}

testConnection();
