
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://asvelariyhlcrnujtqsq.supabase.co";
const SUPABASE_KEY = "sb_publishable_T6-Wlk2PumuS8_xzBRI3ng_KWouOIDi";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runChaosTest() {
    console.log("🌪️ STARTING CHAOS-PULSE EDGE-CASE TEST...");
    
    const { data: products } = await supabase.from('products').select('*');
    if (!products || products.length < 2) {
        console.error("❌ Insufficient products for chaos test.");
        return;
    }

    // SCENARIO 1: THE WINDOW SHOPPER (Search Stress)
    const shopperPhone = "9999900100";
    console.log("🔍 SCENARIO 1: The Window Shopper [Stress Search Logs]");
    const searches = ["Milk", "Bread", "Eggs", "Coke", "Pepsi", "Chips", "Chocolate", "Ice Cream", "Mango", "Banana"];
    for (const s of searches) {
        await supabase.from('search_logs').insert({ query: s, customer_phone: shopperPhone });
        await supabase.from('user_activity').insert({ customer_phone: shopperPhone, action: 'SEARCH', details: { query: s } });
    }

    // SCENARIO 2: THE INDECISIVE BUYER (Activity Stress)
    const indecisivePhone = "9999900101";
    console.log("🛒 SCENARIO 2: The Indecisive Buyer [Add/Remove Cycle]");
    for (let i = 0; i < 15; i++) {
        const p = products[i % products.length];
        await supabase.from('user_activity').insert({ 
            customer_phone: indecisivePhone, 
            action: i % 2 === 0 ? 'CART_ADD' : 'CART_REMOVE', 
            details: { name: p.name, id: p.id } 
        });
    }

    // SCENARIO 3: THE LOGISTICS NIGHTMARE (Data Density)
    const nightmarePhone = "9999900102";
    console.log("🏠 SCENARIO 3: The Logistics Nightmare [Extreme Address Length]");
    const nightmareAddress = {
        title: "Sector 45 - Block C - Apartment 902 - Floor 9 - Tower 4 - Wing B - Near The Old Banyan Tree Behind The Water Tank",
        area: "Kukatpally Housing Board Phase 9 Extension Area - Near JNTU Metro Pillar 456",
        landmark: "The one with the yellow gate and the big white dog on the balcony, third door from the left after the speed breaker"
    };
    await supabase.from('orders').insert({
        customer_phone: nightmarePhone,
        customer_name: "Christopher Maximus Decimus Meridius",
        total_amount: 1500,
        status: 'Packing',
        address: nightmareAddress,
        items: [{ name: "Bulk Groceries", quantity: 10, price: 150 }]
    });

    // SCENARIO 4: THE FLASH SALE RACE (Stock Collision)
    console.log("🏁 SCENARIO 4: The Flash Sale Race [Stock Collision Check]");
    const targetProduct = products[0];
    const racers = ["9999900201", "9999900202", "9999900203", "9999900204", "9999900205"];
    
    // Simulate concurrent stock updates
    const racePromises = racers.map(async (phone) => {
        // Try to decrement stock by 1
        const { data: current } = await supabase.from('products').select('stock').eq('id', targetProduct.id).single();
        if (current && current.stock > 0) {
            await supabase.from('products').update({ stock: current.stock - 1 }).eq('id', targetProduct.id);
            return `Success: ${phone}`;
        }
        return `Fail: ${phone}`;
    });
    const results = await Promise.all(racePromises);
    console.log("Race Results:", results);

    console.log("✅ CHAOS-PULSE COMPLETE.");
    console.log("👉 Audit your 'Customer Intelligence' and 'Live Orders' to see the edge cases in action.");
}

runChaosTest();
