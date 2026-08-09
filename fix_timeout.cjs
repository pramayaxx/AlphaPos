const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/connect_timeout: 5/g, 'connect_timeout: 15');

fs.writeFileSync('server.ts', code);
console.log("Patched timeout");
