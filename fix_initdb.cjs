const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');

// Replace await sql\` with await sql.unsafe(\` inside initDb only
// It's easier to just do a string replace of the specific block

code = code.replace(/await sql\`\n      CREATE TABLE IF NOT EXISTS branches/g, "await sql.unsafe(`\n      CREATE TABLE IF NOT EXISTS branches");

code = code.replace(/    \`;\n\n    await sql\`\n      CREATE TABLE IF NOT EXISTS bills/g, "    `);\n\n    await sql.unsafe(`\n      CREATE TABLE IF NOT EXISTS bills");

code = code.replace(/    \`;\n\n    await sql\`\n      CREATE TABLE IF NOT EXISTS shop_settings/g, "    `);\n\n    await sql.unsafe(`\n      CREATE TABLE IF NOT EXISTS shop_settings");

code = code.replace(/CREATE TABLE IF NOT EXISTS shop_settings \([\\s\\S]*?\`;/m, match => match.replace(/\`;$/, "`);"));

code = code.replace(/await sql\`\n      CREATE TABLE IF NOT EXISTS users/g, "await sql.unsafe(`\n      CREATE TABLE IF NOT EXISTS users");
code = code.replace(/    \`;\n    \n    await sql\.unsafe\(\`/g, "    `);\n    \n    await sql.unsafe(`");

fs.writeFileSync('server.ts', code);
console.log("Fixed initDb");
