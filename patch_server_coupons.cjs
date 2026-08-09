const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const tableInitCode = `
    await sql\`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        code VARCHAR(50) NOT NULL,
        discount_type VARCHAR(20) NOT NULL,
        discount_value NUMERIC(10, 2) NOT NULL,
        min_purchase NUMERIC(10, 2) DEFAULT 0,
        valid_until TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`;
`;

// Insert after cash_shifts table
code = code.replace(/CREATE TABLE IF NOT EXISTS cash_shifts[\s\S]*?\n    \`;/, match => match + "\n" + tableInitCode);

const newRoutes = `
// --- Coupons Routes ---
app.get('/api/coupons', authenticateToken, async (req: any, res) => {
  try {
    const coupons = await sql\`SELECT * FROM coupons WHERE user_id = \${req.user.tenantId} ORDER BY created_at DESC\`;
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/coupons', authenticateToken, async (req: any, res) => {
  try {
    const { code, discount_type, discount_value, min_purchase, valid_until } = req.body;
    const newCoupon = await sql\`
      INSERT INTO coupons (user_id, code, discount_type, discount_value, min_purchase, valid_until)
      VALUES (\${req.user.tenantId}, \${code.toUpperCase()}, \${discount_type}, \${discount_value}, \${min_purchase}, \${valid_until || null})
      RETURNING *
    \`;
    res.json(newCoupon[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/coupons/:id/toggle', authenticateToken, async (req: any, res) => {
  try {
    const couponId = req.params.id;
    const { is_active } = req.body;
    await sql\`
      UPDATE coupons SET is_active = \${is_active} 
      WHERE id = \${couponId} AND user_id = \${req.user.tenantId}
    \`;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/coupons/validate', authenticateToken, async (req: any, res) => {
  try {
    const { code } = req.body;
    const coupons = await sql\`
      SELECT * FROM coupons 
      WHERE user_id = \${req.user.tenantId} 
      AND code = \${code.toUpperCase()} 
      AND is_active = TRUE
    \`;
    
    if (coupons.length === 0) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }
    
    const coupon = coupons[0];
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    
    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
`;

code = code.replace(/\/\/ --- Cash Shifts Routes ---/, newRoutes + '\n// --- Cash Shifts Routes ---');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with Coupons");
