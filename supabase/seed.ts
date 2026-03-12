// Seed script — Real menu data from app.queroumpedacinho.com.br
// Run: npx tsx supabase/seed.ts

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pkjrenijzgyzqilqpjyl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBranJlbmlqemd5enFpbHFwanlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzEwMTM4MiwiZXhwIjoyMDg4Njc3MzgyfQ.V1H7qIhO_iqoyXFMzPssfs6XnMcZeTKK72iigNnlkL0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const products = [
    // === PIZZAS TRADICIONAIS ===
    {
        name: 'Diavola - Calabresa',
        description: 'Calabresa artesanal, cebola caramelizada e azeitonas pretas',
        category: 'tradicional',
        price: 9.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Margherita',
        description: 'Molho de tomate, mussarela de búfala, manjericão fresco e azeite extra virgem',
        category: 'tradicional',
        price: 10.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Portuguesa',
        description: 'Presunto, ovos, cebola, azeitonas, ervilha e mussarela - molho de tomate e linguiça artesanal',
        category: 'tradicional',
        price: 15.00,
        image_url: null,
        is_active: true,
    },

    // === PIZZAS ESPECIAIS ===
    {
        name: 'Quatro Queijos',
        description: 'Mussarela, gorgonzola, parmesão e provolone derretidos',
        category: 'especial',
        price: 9.50,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Frango com Catupiry',
        description: 'Frango desfiado, catupiry cremoso, milho e orégano',
        category: 'especial',
        price: 12.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Pepperoni Premium',
        description: 'Pepperoni, mussarela especial, tomates-cereja e manjericão',
        category: 'especial',
        price: 15.00,
        image_url: null,
        is_active: true,
    },

    // === PIZZAS DOCES ===
    {
        name: 'Chocolate com Morango',
        description: 'Creme de chocolate belga, morangos frescos e leite condensado',
        category: 'doce',
        price: 7.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Banana com Canela',
        description: 'Banana caramelizada, canela, açúcar e leite condensado',
        category: 'doce',
        price: 10.00,
        image_url: null,
        is_active: true,
    },

    // === CAFETERIA & SALGADOS ===
    {
        name: 'Capuccino',
        description: 'Canela e chantilly',
        category: 'cafeteria',
        price: 15.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Café Express',
        description: 'Café espresso fresco',
        category: 'cafeteria',
        price: 10.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Chocolate Quente',
        description: 'Chocolate quente cremoso',
        category: 'cafeteria',
        price: 9.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Misto Quente',
        description: 'Queijo e presunto no pão crocante',
        category: 'cafeteria',
        price: 10.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Misto Quente Especial',
        description: 'Mussarela, presunto e ovo',
        category: 'cafeteria',
        price: 12.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Enroladinho de Queijo com Coco',
        description: 'Enroladinho artesanal de queijo com coco',
        category: 'cafeteria',
        price: 10.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Porção Mini Pão de Queijo Tradicional',
        description: '6 unidades de pão de queijo tradicional',
        category: 'cafeteria',
        price: 15.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Porção Mini Pão de Queijo Gourmet',
        description: '6 unidades de pão de queijo gourmet',
        category: 'cafeteria',
        price: 18.00,
        image_url: null,
        is_active: true,
    },

    // === BEBIDAS - CERVEJAS ===
    {
        name: 'Stella Artois Lata',
        description: 'Cerveja Stella Artois lata 350ml',
        category: 'bebida',
        price: 8.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Heineken Lata',
        description: 'Cerveja Heineken lata 350ml',
        category: 'bebida',
        price: 8.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Heineken Long Neck',
        description: 'Cerveja Heineken long neck 330ml',
        category: 'bebida',
        price: 15.00,
        image_url: null,
        is_active: true,
    },

    // === BEBIDAS - REFRIGERANTES ===
    {
        name: 'Coca-Cola Normal 350ml',
        description: 'Refrigerante Coca-Cola lata 350ml',
        category: 'bebida',
        price: 6.50,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Coca-Cola Zero 350ml',
        description: 'Refrigerante Coca-Cola Zero lata 350ml',
        category: 'bebida',
        price: 5.00,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Guaraná Antarctica 350ml',
        description: 'Refrigerante Guaraná Antarctica lata 350ml',
        category: 'bebida',
        price: 6.50,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Fanta Laranja 350ml',
        description: 'Refrigerante Fanta Laranja lata 350ml',
        category: 'bebida',
        price: 6.50,
        image_url: null,
        is_active: true,
    },
    {
        name: 'Schweppes Citrus 350ml',
        description: 'Refrigerante Schweppes Citrus lata 350ml',
        category: 'bebida',
        price: 6.50,
        image_url: null,
        is_active: true,
    },
];

async function seed() {
    console.log('🍕 Seeding REAL pizzaria products (aligned with production app)...\n');

    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
        console.error('⚠️  Could not clear existing products:', deleteError.message);
    }

    const { data, error } = await supabase
        .from('products')
        .insert(products)
        .select();

    if (error) {
        console.error('❌ Error seeding products:', error.message);
        process.exit(1);
    }

    console.log(`✅ Inserted ${data.length} products successfully!\n`);

    const categories = [...new Set(products.map(p => p.category))];
    for (const cat of categories) {
        const items = products.filter(p => p.category === cat);
        console.log(`   📦 ${cat}: ${items.length} items`);
        for (const item of items) {
            console.log(`      → ${item.name} — R$ ${item.price.toFixed(2)}`);
        }
        console.log('');
    }

    console.log('🎉 Seed complete! All prices aligned with production app.');
}

seed();
