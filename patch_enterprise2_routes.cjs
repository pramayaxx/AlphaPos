const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const enterprise2Routes = `
// --- Enterprise 2 Routes ---
app.get('/api/shifts', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql\`SELECT * FROM shifts WHERE user_id = \${req.user.tenantId} ORDER BY start_time DESC\`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/shifts/open', authenticateToken, async (req: any, res) => {
  try {
    const { starting_cash, staff_id } = req.body;
    const data = await sql\`INSERT INTO shifts (user_id, staff_id, starting_cash, status) VALUES (\${req.user.tenantId}, \${staff_id}, \${starting_cash}, 'OPEN') RETURNING *\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/shifts/close/:id', authenticateToken, async (req: any, res) => {
  try {
    const { ending_cash, expected_cash } = req.body;
    const data = await sql\`UPDATE shifts SET ending_cash = \${ending_cash}, expected_cash = \${expected_cash}, end_time = CURRENT_TIMESTAMP, status = 'CLOSED' WHERE id = \${req.params.id} RETURNING *\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.get('/api/recipes', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql\`
      SELECT r.*, p1.name as product_name, p2.name as raw_material_name
      FROM recipes r
      JOIN products p1 ON r.product_id = p1.id
      JOIN products p2 ON r.raw_material_product_id = p2.id
    \`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/recipes', authenticateToken, async (req: any, res) => {
  try {
    const { product_id, raw_material_product_id, quantity_needed } = req.body;
    const data = await sql\`INSERT INTO recipes (product_id, raw_material_product_id, quantity_needed) VALUES (\${product_id}, \${raw_material_product_id}, \${quantity_needed}) RETURNING *\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.get('/api/invoices', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql\`SELECT i.*, c.name as customer_name FROM invoices i JOIN customers c ON i.customer_id = c.id WHERE i.user_id = \${req.user.tenantId} ORDER BY i.created_at DESC\`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/invoices', authenticateToken, async (req: any, res) => {
  try {
    const { customer_id, amount, due_date } = req.body;
    const data = await sql\`INSERT INTO invoices (user_id, customer_id, amount, due_date) VALUES (\${req.user.tenantId}, \${customer_id}, \${amount}, \${due_date}) RETURNING *\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/verify-pin', authenticateToken, async (req: any, res) => {
  try {
    const { pin } = req.body;
    const data = await sql\`SELECT * FROM staff WHERE pin = \${pin} AND role IN ('MANAGER', 'ADMIN') AND user_id = \${req.user.tenantId}\`;
    if (data.length > 0) res.json({ success: true, manager: data[0] });
    else res.json({ success: false });
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
`;

if (!code.includes('/api/shifts')) {
  code = code.replace(/app\.listen/, enterprise2Routes + "\napp.listen");
}

fs.writeFileSync('server.ts', code);
console.log("Enterprise Part 2 routes patched.");
