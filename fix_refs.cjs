const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/bill_id INTEGER REFERENCES bills\(id\)/g, 'bill_id UUID REFERENCES bills(id)');
code = code.replace(/product_id INTEGER REFERENCES products\(id\)/g, 'product_id UUID REFERENCES products(id)');
code = code.replace(/raw_material_product_id INTEGER REFERENCES products\(id\)/g, 'raw_material_product_id UUID REFERENCES products(id)');

// Also I notice the `await sql` syntax errors inside `initDb` might still be there for lines after 350?
// wait, the `initDb` function has `await sql\`` for everything else!
// The previous errors were "cannot insert multiple commands into a prepared statement"
// But the remaining ones in `server.ts` (lines 350-580) are ALSO `await sql\``!
// They will fail too!
// I need to change all `await sql\`` inside `initDb` to `await sql.unsafe(\``.

const startIdx = code.indexOf('async function initDb() {');
const endIdx = code.indexOf('async function startServer()', startIdx);
let initDbStr = code.substring(startIdx, endIdx);

initDbStr = initDbStr.replace(/await sql\`\s*CREATE TABLE([\s\S]*?)\`;/g, (match, p1) => {
    return 'await sql.unsafe(`\n      CREATE TABLE' + p1 + '`);';
});

code = code.substring(0, startIdx) + initDbStr + code.substring(endIdx);
fs.writeFileSync('server.ts', code);
console.log('Fixed refs and initDb');
