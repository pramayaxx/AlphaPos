const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "    await sql\`\n      try { await sql\`ALTER TABLE users ADD COLUMN owner_id INTEGER REFERENCES users(id)\`; } catch(e) {}\n      CREATE TABLE IF NOT EXISTS users (",
  "    try { await sql\`ALTER TABLE users ADD COLUMN owner_id INTEGER REFERENCES users(id)\`; } catch(e) {}\n    await sql\`\n      CREATE TABLE IF NOT EXISTS users ("
);

fs.writeFileSync('server.ts', code);
