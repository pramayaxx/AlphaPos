const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const missingRoutes = `
// --- Invoices Routes ---
app.get('/api/invoices', authenticateToken, async (req: any, res) => {
  try {
    const invoices = await sql\`SELECT * FROM invoices WHERE user_id = \${req.user.tenantId} ORDER BY date_time DESC\`;
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Recipes Routes ---
app.get('/api/recipes', authenticateToken, async (req: any, res) => {
  try {
    const recipes = await sql\`SELECT * FROM recipes WHERE user_id = \${req.user.tenantId} ORDER BY id DESC\`;
    res.json(recipes);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/recipes', authenticateToken, async (req: any, res) => {
  try {
    const { product_id, raw_material_product_id, quantity } = req.body;
    const recipe = await sql\`
      INSERT INTO recipes (user_id, product_id, raw_material_product_id, quantity)
      VALUES (\${req.user.tenantId}, \${product_id}, \${raw_material_product_id}, \${quantity})
      RETURNING *
    \`;
    res.json(recipe[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Verify PIN Route ---
app.post('/api/verify-pin', authenticateToken, async (req: any, res) => {
  try {
    const { pin } = req.body;
    // For simplicity, check if the pin matches the current user or any superadmin/manager
    const users = await sql\`SELECT * FROM users WHERE id = \${req.user.id}\`;
    const user = users[0];
    
    // Check against staff table or user table?
    const staff = await sql\`SELECT * FROM staff WHERE user_id = \${req.user.tenantId} AND pin = \${pin}\`;
    
    if (staff.length > 0) {
      res.json({ success: true, role: staff[0].role, user: staff[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid PIN' });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

`;

const insertIndex = code.indexOf('export default app;');
if (insertIndex !== -1) {
  code = code.substring(0, insertIndex) + missingRoutes + code.substring(insertIndex);
  fs.writeFileSync('server.ts', code);
  console.log('Added missing routes');
} else {
  console.log('export default app; not found');
}
