const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Patch login route to check for suspended status
code = code.replace(/const token = jwt.sign\(\{ userId: user\.id, tenantId: user\.owner_id \|\| user\.id \}, JWT_SECRET\);/, 
  "if (user.status === 'SUSPENDED') { return res.status(403).json({ message: 'Account Suspended.' }); }\n" +
  "      const token = jwt.sign({ userId: user.id, tenantId: user.owner_id || user.id }, JWT_SECRET);"
);
      
code = code.replace(/res\.json\(\{ token \}\);/, 'res.json({ token, user: { id: user.id, is_superadmin: user.is_superadmin, status: user.status, package_type: user.package_type } });');

// Make first user superadmin automatically on signup
const superAdminLogic = "let is_superadmin = false; const adminCheck = await sql`SELECT COUNT(*) FROM users WHERE is_superadmin = true`; if (parseInt(adminCheck[0].count) === 0) { is_superadmin = true; }";

code = code.replace(/const hashedPassword = await bcrypt\.hash\(password, 10\);/, superAdminLogic + '\n    const hashedPassword = await bcrypt.hash(password, 10);');

code = code.replace(/INSERT INTO users \(email, password, full_name, role\)/, 'INSERT INTO users (email, password, full_name, role, is_superadmin)');
code = code.replace(/VALUES \(\\\$\{email\}, \\\$\{hashedPassword\}, \\\$\{fullName\}, 'admin'\)/, "VALUES (${email}, ${hashedPassword}, ${fullName}, 'admin', ${is_superadmin})");

fs.writeFileSync('server.ts', code);
console.log("Super Admin Auth Patched.");
