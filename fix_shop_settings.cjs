const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /\) VALUES \(\n\s*\$\{req\.user\.id\}/g,
  ") VALUES (\n        ${req.user.tenantId}"
);

fs.writeFileSync('server.ts', code);
