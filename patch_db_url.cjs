const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/const dbUrl = process\.env\.DATABASE_URL \|\| process\.env\.POSTGRES_URL \|\| process\.env\.STORAGE_URL \|\| process\.env\.DATABASE \|\| 'postgresql:\/\/user:pass@host\/db';/,
"const dbUrl = process.env.VITE_XATA_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL || process.env.DATABASE || 'postgresql://user:pass@host/db';");

fs.writeFileSync('server.ts', code);
console.log("Patched db url");
