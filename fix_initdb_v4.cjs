const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const startIdx = code.indexOf('async function initDb() {');
const endIdx = code.indexOf('async function startServer()', startIdx);
let initDbStr = code.substring(startIdx, endIdx);

initDbStr = initDbStr.replace(/await sql\.unsafe\(\`ALTER(.*?)(\`|\\\`)\;/g, 'await sql.unsafe(`ALTER$1`);');
code = code.substring(0, startIdx) + initDbStr + code.substring(endIdx);
fs.writeFileSync('server.ts', code);
console.log('Fixed syntax errors');
