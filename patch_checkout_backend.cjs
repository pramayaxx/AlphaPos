const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/const bill = await sql\`INSERT INTO bills \([\s\S]*?RETURNING \*\`;/, match => {
  return match + `
    if (req.body.table_id) {
      await sql\`UPDATE restaurant_tables SET status = 'OCCUPIED' WHERE id = \${req.body.table_id}\`;
      await sql\`INSERT INTO kds_orders (bill_id, table_id, notes) VALUES (\${bill[0].id}, \${req.body.table_id}, \${req.body.kds_notes || ''})\`;
    }
  `;
});

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts for KDS orders.");
