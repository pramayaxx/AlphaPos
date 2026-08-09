const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const tableInitCode = `
    await sql\`
      CREATE TABLE IF NOT EXISTS cash_shifts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        opened_by VARCHAR(255) NOT NULL,
        closed_by VARCHAR(255),
        opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP,
        opening_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
        closing_balance NUMERIC(10, 2),
        expected_balance NUMERIC(10, 2),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'open'
      )
    \`;
`;

// Insert after purchase_orders table
code = code.replace(/CREATE TABLE IF NOT EXISTS purchase_orders[\s\S]*?\n    \`;/, match => match + "\n" + tableInitCode);

const newRoutes = `
// --- Cash Shifts Routes ---
app.get('/api/shifts/current', authenticateToken, async (req: any, res) => {
  try {
    const shifts = await sql\`SELECT * FROM cash_shifts WHERE user_id = \${req.user.tenantId} AND status = 'open' ORDER BY opened_at DESC LIMIT 1\`;
    if (shifts.length > 0) {
      res.json(shifts[0]);
    } else {
      res.json(null);
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/shifts', authenticateToken, async (req: any, res) => {
  try {
    const shifts = await sql\`SELECT * FROM cash_shifts WHERE user_id = \${req.user.tenantId} ORDER BY opened_at DESC LIMIT 50\`;
    res.json(shifts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/shifts/open', authenticateToken, async (req: any, res) => {
  try {
    const { opening_balance, notes } = req.body;
    const newShift = await sql\`
      INSERT INTO cash_shifts (user_id, opened_by, opening_balance, notes, status)
      VALUES (\${req.user.tenantId}, \${req.user.username}, \${opening_balance}, \${notes}, 'open')
      RETURNING *
    \`;
    res.json(newShift[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/shifts/:id/close', authenticateToken, async (req: any, res) => {
  try {
    const { closing_balance, expected_balance, notes } = req.body;
    const shiftId = req.params.id;
    const closedShift = await sql\`
      UPDATE cash_shifts
      SET status = 'closed',
          closed_by = \${req.user.username},
          closed_at = CURRENT_TIMESTAMP,
          closing_balance = \${closing_balance},
          expected_balance = \${expected_balance},
          notes = \${notes}
      WHERE id = \${shiftId} AND user_id = \${req.user.tenantId}
      RETURNING *
    \`;
    res.json(closedShift[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
`;

code = code.replace(/\/\/ --- Suppliers Routes ---/, newRoutes + '\n// --- Suppliers Routes ---');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with Shifts");
