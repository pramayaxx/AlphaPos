const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(
  `let sql;\ntry {\n  sql = postgres(dbUrl);\n} catch(e) {\n  console.error('Invalid DB URL:', e);\n  sql = postgres('postgresql://user:pass@host/db');\n}`,
  `let sql: any;\ntry {\n  const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');\n  sql = postgres(dbUrl, { ssl: isLocal ? false : 'require' });\n} catch(e) {\n  console.error('Invalid DB URL:', e);\n  sql = postgres('postgresql://user:pass@host/db');\n}`
);
fs.writeFileSync('server.ts', code);
