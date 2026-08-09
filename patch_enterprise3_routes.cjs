const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const enterprise3Routes = `
// --- Enterprise 3 Routes (Super Admin, Staff, Shop Settings) ---
app.get('/api/me', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql\`SELECT id, email, full_name, role, package_type, status, next_billing_date, is_superadmin FROM users WHERE id = \${req.user.tenantId}\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

// Super Admin
const requireSuperAdmin = async (req: any, res: any, next: any) => {
  const data = await sql\`SELECT is_superadmin FROM users WHERE id = \${req.user.tenantId}\`;
  if (data[0]?.is_superadmin) next();
  else res.status(403).json({message: "Super Admin Only"});
};

app.get('/api/superadmin/tenants', authenticateToken, requireSuperAdmin, async (req: any, res) => {
  try {
    const data = await sql\`SELECT id, email, full_name, package_type, status, next_billing_date, created_at FROM users WHERE is_superadmin = false ORDER BY created_at DESC\`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.post('/api/superadmin/tenants/:id/status', authenticateToken, requireSuperAdmin, async (req: any, res) => {
  try {
    const { status } = req.body;
    await sql\`UPDATE users SET status = \${status} WHERE id = \${req.params.id}\`;
    res.json({ success: true });
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.post('/api/superadmin/tenants/:id/package', authenticateToken, requireSuperAdmin, async (req: any, res) => {
  try {
    const { package_type } = req.body;
    await sql\`UPDATE users SET package_type = \${package_type} WHERE id = \${req.params.id}\`;
    res.json({ success: true });
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.get('/api/superadmin/stats', authenticateToken, requireSuperAdmin, async (req: any, res) => {
  try {
    const total = await sql\`SELECT COUNT(*) FROM users WHERE is_superadmin = false\`;
    const active = await sql\`SELECT COUNT(*) FROM users WHERE is_superadmin = false AND status = 'ACTIVE'\`;
    // Dummy revenue metric
    res.json({ total: total[0].count, active: active[0].count, revenue: parseInt(active[0].count) * 50 });
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

// Staff
app.get('/api/staff', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql\`SELECT * FROM staff WHERE user_id = \${req.user.tenantId}\`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/staff', authenticateToken, async (req: any, res) => {
  try {
    const { full_name, phone, role, pin } = req.body;
    const data = await sql\`INSERT INTO staff (user_id, full_name, phone, role, pin) VALUES (\${req.user.tenantId}, \${full_name}, \${phone}, \${role}, \${pin}) RETURNING *\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.delete('/api/staff/:id', authenticateToken, async (req: any, res) => {
  try {
    await sql\`DELETE FROM staff WHERE id = \${req.params.id} AND user_id = \${req.user.tenantId}\`;
    res.json({success:true});
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

// Shop Settings
app.get('/api/shop-settings', authenticateToken, async (req: any, res) => {
  try {
    let data = await sql\`SELECT * FROM shop_settings WHERE user_id = \${req.user.tenantId}\`;
    if (data.length === 0) {
       await sql\`INSERT INTO shop_settings (user_id, name) VALUES (\${req.user.tenantId}, 'My Store')\`;
       data = await sql\`SELECT * FROM shop_settings WHERE user_id = \${req.user.tenantId}\`;
    }
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/shop-settings', authenticateToken, async (req: any, res) => {
  try {
    const { name, phone, address, receipt_footer } = req.body;
    const data = await sql\`UPDATE shop_settings SET name = \${name}, phone = \${phone}, address = \${address}, receipt_footer = \${receipt_footer} WHERE user_id = \${req.user.tenantId} RETURNING *\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

`;

if (!code.includes('/api/superadmin')) {
  code = code.replace(/app\.listen/, enterprise3Routes + "\napp.listen");
}

fs.writeFileSync('server.ts', code);
console.log("Enterprise Part 3 routes patched.");
