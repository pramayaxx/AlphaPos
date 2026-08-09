const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "jwt.sign({ id: user.id, email: user.email }, JWT_SECRET)",
  "jwt.sign({ id: user.id, email: user.email, tenantId: user.owner_id || user.id }, JWT_SECRET)"
);

code = code.replace(
  /WHERE user_id = \$\{req\.user\.id\}/g,
  "WHERE user_id = ${req.user.tenantId}"
);
code = code.replace(
  /VALUES \(\$\{req\.user\.id\}/g,
  "VALUES (${req.user.tenantId}"
);
code = code.replace(
  /AND user_id = \$\{req\.user\.id\}/g,
  "AND user_id = ${req.user.tenantId}"
);

// We need to add the staff management routes
const staffRoutes = `
// --- Staff Routes ---
app.get('/api/staff', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.id !== req.user.tenantId) {
      return res.status(403).json({ message: 'Only admins can view staff' });
    }
    const staff = await sql\`SELECT id, email, full_name as "fullName", role FROM users WHERE owner_id = \${req.user.id}\`;
    res.json(staff);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/staff', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.id !== req.user.tenantId) {
      return res.status(403).json({ message: 'Only admins can add staff' });
    }
    const { email, password, fullName, role } = req.body;
    const existing = await sql\`SELECT * FROM users WHERE email = \${email}\`;
    if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await sql\`
      INSERT INTO users (email, password, full_name, role, owner_id) 
      VALUES (\${email}, \${hashedPassword}, \${fullName}, \${role || 'cashier'}, \${req.user.id})
      RETURNING id, email, full_name, role
    \`;
    res.json(user[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/staff/:id', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.id !== req.user.tenantId) {
      return res.status(403).json({ message: 'Only admins can delete staff' });
    }
    await sql\`DELETE FROM users WHERE id = \${req.params.id} AND owner_id = \${req.user.id}\`;
    res.json({ message: 'Staff deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

`;

code = code.replace("// --- Auth Routes ---", staffRoutes + "// --- Auth Routes ---");

fs.writeFileSync('server.ts', code);
