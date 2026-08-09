const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// 1. Add tables
const tableInitCode = `
      await sql\`ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS tax_name VARCHAR(50) DEFAULT 'Tax'\`;
    } catch(e) {
      console.warn("Alter table error (ignorable if columns exist):", e);
    }
    
    // Add debt to customers
    try { await sql\`ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_debt NUMERIC(10, 2) DEFAULT 0\`; } catch (e) {}

    await sql\`
      CREATE TABLE IF NOT EXISTS customer_payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        customer_id INTEGER REFERENCES customers(id),
        amount NUMERIC(10, 2),
        date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`;

    await sql\`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        description VARCHAR(255),
        amount NUMERIC(10, 2),
        date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        category VARCHAR(100)
      )
    \`;
`;

code = code.replace(/await sql`ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS tax_name VARCHAR\(50\) DEFAULT 'Tax'`;[\s\S]*?console\.warn\("Alter table error \(ignorable if columns exist\):", e\);\s*\}/, tableInitCode);

// 2. Add API Routes for Expenses and Payments
const newRoutes = `
// --- Expenses Routes ---
app.get('/api/expenses', authenticateToken, async (req: any, res) => {
  try {
    const expenses = await sql\`SELECT * FROM expenses WHERE user_id = \${req.user.tenantId} ORDER BY date_time DESC\`;
    res.json(expenses.map(e => ({...e, date_time: new Date(e.date_time), amount: Number(e.amount)})));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/expenses', authenticateToken, async (req: any, res) => {
  try {
    const { description, amount, category, date_time } = req.body;
    const e = await sql\`
      INSERT INTO expenses (user_id, description, amount, category, date_time)
      VALUES (\${req.user.tenantId}, \${description}, \${amount}, \${category || 'General'}, \${date_time || new Date()})
      RETURNING *
    \`;
    res.json({...e[0], date_time: new Date(e[0].date_time), amount: Number(e[0].amount)});
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Customer Payments ---
app.post('/api/customers/:id/pay', authenticateToken, async (req: any, res) => {
  try {
    const customerId = req.params.id;
    const { amount } = req.body;
    
    await sql\`
      INSERT INTO customer_payments (user_id, customer_id, amount)
      VALUES (\${req.user.tenantId}, \${customerId}, \${amount})
    \`;
    
    const updated = await sql\`
      UPDATE customers 
      SET total_debt = GREATEST(0, COALESCE(total_debt, 0) - \${amount})
      WHERE id = \${customerId} AND user_id = \${req.user.tenantId}
      RETURNING *
    \`;
    
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
`;

code = code.replace(/\/\/ --- Settings Routes ---/, newRoutes + '\n// --- Settings Routes ---');

// 3. Update Bill saving to increase debt if payment is credit
const saveBillCode = `
    const savedBill = bills[0];

    if (b.paymentMethod === 'credit' && b.customerId) {
      await sql\`
        UPDATE customers
        SET total_debt = COALESCE(total_debt, 0) + \${b.grandTotal}
        WHERE id = \${b.customerId} AND user_id = \${req.user.tenantId}
      \`;
    }
`;

code = code.replace(/const savedBill = bills\[0\];/, saveBillCode);

// 4. Update Customers GET
code = code.replace(/SELECT \* FROM customers WHERE user_id =/g, "SELECT id, name, phone, email, loyalty_points, COALESCE(total_debt, 0) as total_debt FROM customers WHERE user_id =");

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts successfully");
