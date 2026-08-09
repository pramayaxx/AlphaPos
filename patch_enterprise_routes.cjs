const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const enterpriseRoutes = `
// --- Enterprise Routes ---
app.get('/api/branches', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql\`SELECT * FROM branches WHERE user_id = \${req.user.tenantId}\`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/branches', authenticateToken, async (req: any, res) => {
  try {
    const { name, location } = req.body;
    const data = await sql\`INSERT INTO branches (user_id, name, location) VALUES (\${req.user.tenantId}, \${name}, \${location}) RETURNING *\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.get('/api/variants/:productId', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql\`SELECT * FROM product_variants WHERE product_id = \${req.params.productId}\`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/variants', authenticateToken, async (req: any, res) => {
  try {
    const { product_id, name, sku, price, stock_quantity } = req.body;
    const data = await sql\`INSERT INTO product_variants (product_id, name, sku, price, stock_quantity) VALUES (\${product_id}, \${name}, \${sku}, \${price}, \${stock_quantity}) RETURNING *\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.get('/api/promotions', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql\`SELECT * FROM promotions WHERE user_id = \${req.user.tenantId}\`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/promotions', authenticateToken, async (req: any, res) => {
  try {
    const { name, promo_type, buy_product_id, get_product_id, discount_percent, start_date, end_date, is_active } = req.body;
    const data = await sql\`INSERT INTO promotions (user_id, name, promo_type, buy_product_id, get_product_id, discount_percent, start_date, end_date, is_active) 
                           VALUES (\${req.user.tenantId}, \${name}, \${promo_type}, \${buy_product_id}, \${get_product_id}, \${discount_percent}, \${start_date}, \${end_date}, \${is_active}) RETURNING *\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.get('/api/payroll', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql\`SELECT p.*, s.full_name as staff_name FROM payroll p LEFT JOIN staff s ON p.staff_id = s.id WHERE p.user_id = \${req.user.tenantId} ORDER BY p.created_at DESC\`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/payroll', authenticateToken, async (req: any, res) => {
  try {
    const { staff_id, period_start, period_end, hours_worked, commission_earned, total_payment, status } = req.body;
    const data = await sql\`INSERT INTO payroll (user_id, staff_id, period_start, period_end, hours_worked, commission_earned, total_payment, status) 
                           VALUES (\${req.user.tenantId}, \${staff_id}, \${period_start}, \${period_end}, \${hours_worked}, \${commission_earned}, \${total_payment}, \${status}) RETURNING *\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
`;

code = code.replace(/app\.listen/, enterpriseRoutes + "\napp.listen");
fs.writeFileSync('server.ts', code);
console.log("Enterprise routes patched.");
