const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Remove CREATE TABLE kds_orders
code = code.replace(/      CREATE TABLE IF NOT EXISTS kds_orders \([\s\S]*?\);\n/g, '');

// Remove INSERT INTO kds_orders
code = code.replace(/    \/\/ Add items to KDS\n    for \(const item of items\) \{\n      await sql`\n        INSERT INTO kds_orders \(user_id, bill_id, product_name, quantity, status, order_time\)\n        VALUES \(\$\{tenantId\}, \$\{bill.id\}, \$\{item.name\}, \$\{item.quantity\}, 'pending', NOW\(\)\)\n      `;\n    \}\n/g, '');

// Remove API routes
code = code.replace(/app\.get\('\/api\/kds', authenticateToken, async \(req: any, res\) => \{\n  try \{\n    const data = await sql`[\s\S]*?WHERE k\.user_id = \$\{req\.user\.tenantId\}`;\n    res\.json\(data\);\n  \} catch\(e: any\) \{ res\.status\(500\)\.json\(\{message: e\.message\}\); \}\n\}\);\n/g, '');

code = code.replace(/app\.put\('\/api\/kds\/:id\/status', authenticateToken, async \(req: any, res\) => \{\n  try \{\n    const \{ status \} = req\.body;\n    await sql`UPDATE kds_orders SET status = \$\{status\} WHERE id = \$\{req\.params\.id\}`;\n    res\.json\(\{success: true\}\);\n  \} catch\(e: any\) \{ res\.status\(500\)\.json\(\{message: e\.message\}\); \}\n\}\);\n/g, '');


fs.writeFileSync('server.ts', code);
