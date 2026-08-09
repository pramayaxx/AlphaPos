const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const tableInitCode = `
    await sql\`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        staff_id INTEGER REFERENCES users(id),
        staff_name VARCHAR(255) NOT NULL,
        clock_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        clock_out TIMESTAMP,
        notes TEXT
      )
    \`;

    await sql\`
      CREATE TABLE IF NOT EXISTS stock_adjustments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id UUID REFERENCES products(id),
        product_name VARCHAR(255),
        change_amount INTEGER NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`;
`;

// Insert after coupons table
code = code.replace(/CREATE TABLE IF NOT EXISTS coupons[\s\S]*?\n    \`;/, match => match + "\n" + tableInitCode);

const newRoutes = `
// --- Attendance Routes ---
app.get('/api/attendance', authenticateToken, async (req: any, res) => {
  try {
    const records = await sql\`SELECT * FROM attendance WHERE user_id = \${req.user.tenantId} ORDER BY clock_in DESC\`;
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/attendance/clock-in', authenticateToken, async (req: any, res) => {
  try {
    const { staff_id, staff_name } = req.body;
    const newRecord = await sql\`
      INSERT INTO attendance (user_id, staff_id, staff_name)
      VALUES (\${req.user.tenantId}, \${staff_id}, \${staff_name})
      RETURNING *
    \`;
    res.json(newRecord[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/attendance/:id/clock-out', authenticateToken, async (req: any, res) => {
  try {
    const recordId = req.params.id;
    const closedRecord = await sql\`
      UPDATE attendance 
      SET clock_out = CURRENT_TIMESTAMP 
      WHERE id = \${recordId} AND user_id = \${req.user.tenantId}
      RETURNING *
    \`;
    res.json(closedRecord[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Stock Adjustments Routes ---
app.get('/api/stock-adjustments', authenticateToken, async (req: any, res) => {
  try {
    const records = await sql\`
      SELECT s.*, p.name as current_product_name 
      FROM stock_adjustments s
      LEFT JOIN products p ON s.product_id = p.id
      WHERE s.user_id = \${req.user.tenantId} 
      ORDER BY s.created_at DESC
    \`;
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/stock-adjustments', authenticateToken, async (req: any, res) => {
  try {
    const { product_id, product_name, change_amount, reason } = req.body;
    
    // Update product stock
    await sql\`
      UPDATE products 
      SET stock_quantity = stock_quantity + \${change_amount}
      WHERE id = \${product_id} AND user_id = \${req.user.tenantId}
    \`;

    // Record adjustment
    const newRecord = await sql\`
      INSERT INTO stock_adjustments (user_id, product_id, product_name, change_amount, reason)
      VALUES (\${req.user.tenantId}, \${product_id}, \${product_name}, \${change_amount}, \${reason})
      RETURNING *
    \`;
    
    res.json(newRecord[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
`;

code = code.replace(/\/\/ --- Coupons Routes ---/, newRoutes + '\n// --- Coupons Routes ---');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with Attendance and Adjustments");
