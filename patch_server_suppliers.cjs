const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const tableInitCode = `
    await sql\`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`;

    await sql\`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        supplier_id INTEGER REFERENCES suppliers(id),
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        cost_price NUMERIC(10, 2),
        status VARCHAR(50) DEFAULT 'received',
        date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`;
`;

// Insert after expenses table
code = code.replace(/CREATE TABLE IF NOT EXISTS expenses[\s\S]*?\n    \`;/, match => match + "\n" + tableInitCode);

const newRoutes = `
// --- Suppliers Routes ---
app.get('/api/suppliers', authenticateToken, async (req: any, res) => {
  try {
    const suppliers = await sql\`SELECT * FROM suppliers WHERE user_id = \${req.user.tenantId} ORDER BY name ASC\`;
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/suppliers', authenticateToken, async (req: any, res) => {
  try {
    const s = req.body;
    const newSupplier = await sql\`
      INSERT INTO suppliers (user_id, name, contact_person, phone, email, address)
      VALUES (\${req.user.tenantId}, \${s.name}, \${s.contact_person}, \${s.phone}, \${s.email}, \${s.address})
      RETURNING *
    \`;
    res.json(newSupplier[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Purchase Orders ---
app.get('/api/purchases', authenticateToken, async (req: any, res) => {
  try {
    const purchases = await sql\`
      SELECT p.*, s.name as supplier_name, pr.name as product_name 
      FROM purchase_orders p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN products pr ON p.product_id = pr.id
      WHERE p.user_id = \${req.user.tenantId} 
      ORDER BY p.date_time DESC
    \`;
    res.json(purchases);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/purchases', authenticateToken, async (req: any, res) => {
  try {
    const p = req.body;
    const newPo = await sql\`
      INSERT INTO purchase_orders (user_id, supplier_id, product_id, quantity, cost_price, status)
      VALUES (\${req.user.tenantId}, \${p.supplier_id}, \${p.product_id}, \${p.quantity}, \${p.cost_price}, 'received')
      RETURNING *
    \`;
    
    // Update stock
    if (p.product_id) {
      await sql\`
        UPDATE products 
        SET stock_quantity = stock_quantity + \${p.quantity}
        WHERE id = \${p.product_id} AND user_id = \${req.user.tenantId}
      \`;
    }
    
    res.json(newPo[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
`;

code = code.replace(/\/\/ --- Expenses Routes ---/, newRoutes + '\n// --- Expenses Routes ---');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with Suppliers");
