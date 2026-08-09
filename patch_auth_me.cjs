const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /SELECT id, email, full_name as "fullName", role FROM users WHERE id = \$\{req\.user\.id\}/,
  'SELECT id, email, full_name as "fullName", role, is_superadmin, package_type, status FROM users WHERE id = ${req.user.id}'
);

fs.writeFileSync('server.ts', code);
console.log("Patched /api/auth/me");
