const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/await sql\.unsafe\(\`ALTER TABLE(.*?)(\`|\\\`)\;/g, 'await sql.unsafe(`ALTER TABLE$1`);');
fs.writeFileSync('server.ts', code);
console.log('Fixed syntax on ALTER TABLE');
