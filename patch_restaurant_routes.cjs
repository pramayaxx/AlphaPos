const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const restRoutes = `
app.get('/api/tables', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql\`SELECT * FROM restaurant_tables ORDER BY id ASC\`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/tables', authenticateToken, async (req: any, res) => {
  try {
    const { name, capacity } = req.body;
    const data = await sql\`INSERT INTO restaurant_tables (name, capacity) VALUES (\${name}, \${capacity}) RETURNING *\`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.put('/api/tables/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const { status } = req.body;
    await sql\`UPDATE restaurant_tables SET status = \${status} WHERE id = \${req.params.id}\`;
    res.json({success: true});
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.get('/api/kds', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql\`
      SELECT k.*, b.items, t.name as table_name 
      FROM kds_orders k 
      LEFT JOIN bills b ON k.bill_id = b.id 
      LEFT JOIN restaurant_tables t ON k.table_id = t.id
      WHERE k.status != 'SERVED'
      ORDER BY k.created_at ASC
    \`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.put('/api/kds/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const { status } = req.body;
    await sql\`UPDATE kds_orders SET status = \${status} WHERE id = \${req.params.id}\`;
    res.json({success: true});
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
`;

if (!code.includes('/api/tables')) {
  code = code.replace(/app\.listen/, restRoutes + "\napp.listen");
  fs.writeFileSync('server.ts', code);
  console.log("Restaurant routes patched.");
}
