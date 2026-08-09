const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(
  `sql = postgres(dbUrl, { ssl: isLocal ? false : 'require' });`,
  `sql = postgres(dbUrl, { ssl: isLocal ? false : 'require', connect_timeout: 5 });`
);
fs.writeFileSync('server.ts', code);
