const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// 1. Add table_reservations table
const tablesSetup = `
    await sql.unsafe(\`
      CREATE TABLE IF NOT EXISTS table_reservations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        table_id INTEGER REFERENCES restaurant_tables(id),
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        reservation_time TIMESTAMP,
        guest_count INTEGER,
        status VARCHAR(20) DEFAULT 'pending'
      )
    \`);
    
    try { await sql\`ALTER TABLE shop_settings ADD COLUMN enable_loyalty_tiers BOOLEAN DEFAULT false\`; } catch (e) {}
    try { await sql\`ALTER TABLE shop_settings ADD COLUMN scale_integration BOOLEAN DEFAULT false\`; } catch (e) {}
    try { await sql\`ALTER TABLE shop_settings ADD COLUMN barcode_scanner_mode BOOLEAN DEFAULT false\`; } catch (e) {}
    try { await sql\`ALTER TABLE staff ADD COLUMN permissions JSONB DEFAULT '{}'::jsonb\`; } catch (e) {}
`;

code = code.replace("console.log('Database tables verified.');", tablesSetup + "\n    console.log('Database tables verified.');");

// 2. Add Routes
const newRoutes = `
// --- Reservations Routes ---
app.get('/api/reservations', authenticateToken, async (req: any, res) => {
  try {
    const reservations = await sql\`SELECT * FROM table_reservations WHERE user_id = \${req.user.tenantId} ORDER BY reservation_time ASC\`;
    res.json(reservations);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});
app.post('/api/reservations', authenticateToken, async (req: any, res) => {
  try {
    const { table_id, customer_name, customer_phone, reservation_time, guest_count } = req.body;
    const data = await sql\`
      INSERT INTO table_reservations (user_id, table_id, customer_name, customer_phone, reservation_time, guest_count, status)
      VALUES (\${req.user.tenantId}, \${table_id}, \${customer_name}, \${customer_phone}, \${reservation_time}, \${guest_count}, 'confirmed')
      RETURNING *
    \`;
    res.json(data[0]);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// --- Public Menu & Ordering ---
app.get('/api/public/menu/:tenantId', async (req: any, res) => {
  try {
    const { tenantId } = req.params;
    const products = await sql\`SELECT id, name, price, category, barcode, sku, allow_partial_quantities, is_recipe FROM products WHERE user_id = \${tenantId}\`;
    res.json(products);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});
app.post('/api/public/orders/:tenantId', async (req: any, res) => {
  try {
    const { tenantId } = req.params;
    const { items, customer_name, customer_phone, total_amount, order_type } = req.body; // order_type = 'online'
    
    // Create Bill
    const bills = await sql\`
      INSERT INTO bills (user_id, uuid, date_time, grand_total, status, order_type, customer_name, customer_phone)
      VALUES (\${tenantId}, gen_random_uuid(), NOW(), \${total_amount}, 'pending', \${order_type || 'online'}, \${customer_name}, \${customer_phone})
      RETURNING *
    \`;
    const bill = bills[0];
    
    // Add items to KDS
    for (const item of items) {
      await sql\`
        INSERT INTO kds_orders (user_id, bill_id, product_name, quantity, status, order_time)
        VALUES (\${tenantId}, \${bill.id}, \${item.name}, \${item.quantity}, 'pending', NOW())
      \`;
    }
    
    res.json({ success: true, bill });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});
`;

const insertIndex = code.indexOf('export default app;');
if (insertIndex !== -1) {
  code = code.substring(0, insertIndex) + newRoutes + code.substring(insertIndex);
  fs.writeFileSync('server.ts', code);
  console.log('Added new routes and tables for reservations, online ordering, CRM, and hardware integration settings.');
} else {
  console.log('export default app; not found');
}
