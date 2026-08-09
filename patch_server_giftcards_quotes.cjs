const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const tableInitCode = `
    await sql\`
      CREATE TABLE IF NOT EXISTS gift_cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        code VARCHAR(50) NOT NULL,
        balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    \`;

    await sql\`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        uuid VARCHAR(255) NOT NULL,
        customer_id VARCHAR(255),
        date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        items JSONB NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL,
        discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
        discount_type VARCHAR(20) DEFAULT 'percent',
        discount_value NUMERIC(10, 2) DEFAULT 0,
        tax_amount NUMERIC(10, 2) DEFAULT 0,
        tax_rate NUMERIC(10, 2) DEFAULT 0,
        grand_total NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending'
      )
    \`;
`;

code = code.replace(/CREATE TABLE IF NOT EXISTS stock_adjustments[\s\S]*?\n    \`;/, match => match + "\n" + tableInitCode);

const newRoutes = `
// --- Gift Cards Routes ---
app.get('/api/gift-cards', authenticateToken, async (req: any, res) => {
  try {
    const cards = await sql\`SELECT * FROM gift_cards WHERE user_id = \${req.user.tenantId} ORDER BY issued_at DESC\`;
    res.json(cards);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/gift-cards', authenticateToken, async (req: any, res) => {
  try {
    const { code, balance } = req.body;
    const newCard = await sql\`
      INSERT INTO gift_cards (user_id, code, balance)
      VALUES (\${req.user.tenantId}, \${code.toUpperCase()}, \${balance})
      RETURNING *
    \`;
    res.json(newCard[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/gift-cards/:id/toggle', authenticateToken, async (req: any, res) => {
  try {
    const cardId = req.params.id;
    const { is_active } = req.body;
    await sql\`
      UPDATE gift_cards SET is_active = \${is_active} 
      WHERE id = \${cardId} AND user_id = \${req.user.tenantId}
    \`;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Quotes Routes ---
app.get('/api/quotes', authenticateToken, async (req: any, res) => {
  try {
    const quotes = await sql\`SELECT * FROM quotes WHERE user_id = \${req.user.tenantId} ORDER BY date_time DESC\`;
    const formatted = quotes.map((q: any) => ({
      ...q,
      items: typeof q.items === 'string' ? JSON.parse(q.items) : q.items
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/quotes', authenticateToken, async (req: any, res) => {
  try {
    const q = req.body;
    const newQuote = await sql\`
      INSERT INTO quotes (
        user_id, uuid, customer_id, items, subtotal, discount, discount_type, discount_value, tax_amount, tax_rate, grand_total, status
      ) VALUES (
        \${req.user.tenantId}, \${q.uuid}, \${q.customerId || null}, \${JSON.stringify(q.items)}, 
        \${q.subtotal}, \${q.discount}, \${q.discountType}, \${q.discountValue}, 
        \${q.taxAmount || 0}, \${q.taxRate || 0}, \${q.grandTotal}, 'pending'
      )
      RETURNING *
    \`;
    res.json(newQuote[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/quotes/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const { status } = req.body;
    const updated = await sql\`
      UPDATE quotes SET status = \${status} 
      WHERE id = \${req.params.id} AND user_id = \${req.user.tenantId}
      RETURNING *
    \`;
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
`;

code = code.replace(/\/\/ --- Stock Adjustments Routes ---/, newRoutes + '\n// --- Stock Adjustments Routes ---');
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with Gift Cards and Quotes");
