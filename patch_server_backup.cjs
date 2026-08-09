const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const backupRoutes = `
// --- Backup Routes ---
app.get('/api/backup/export', authenticateToken, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const products = await sql\`SELECT * FROM products WHERE user_id = \${tenantId}\`;
    const customers = await sql\`SELECT * FROM customers WHERE user_id = \${tenantId}\`;
    const bills = await sql\`SELECT * FROM bills WHERE user_id = \${tenantId}\`;
    const billItems = await sql\`SELECT * FROM bill_items WHERE user_id = \${tenantId}\`;
    const expenses = await sql\`SELECT * FROM expenses WHERE user_id = \${tenantId}\`;
    
    res.json({
      timestamp: new Date().toISOString(),
      products,
      customers,
      bills,
      billItems,
      expenses
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
`;

code = code.replace(/app\.listen/, backupRoutes + "\napp.listen");
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with Backup Routes");
