const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const migrations = `
    try { await sql.unsafe(\`ALTER TABLE shop_settings ADD COLUMN enable_loyalty BOOLEAN DEFAULT false\`); } catch (e) {}
    try { await sql.unsafe(\`ALTER TABLE shop_settings ADD COLUMN amount_per_point NUMERIC(10, 2) DEFAULT 0\`); } catch (e) {}
    try { await sql.unsafe(\`ALTER TABLE shop_settings ADD COLUMN value_per_point NUMERIC(10, 2) DEFAULT 0\`); } catch (e) {}
    try { await sql.unsafe(\`ALTER TABLE bills ADD COLUMN points_used INTEGER DEFAULT 0\`); } catch (e) {}
    try { await sql.unsafe(\`ALTER TABLE bills ADD COLUMN points_earned INTEGER DEFAULT 0\`); } catch (e) {}
`;

code = code.replace("try { await sql`ALTER TABLE bills ADD COLUMN status VARCHAR(50) DEFAULT 'paid'`; } catch (e) {}", 
  "try { await sql`ALTER TABLE bills ADD COLUMN status VARCHAR(50) DEFAULT 'paid'`; } catch (e) {}\n" + migrations);

fs.writeFileSync('server.ts', code);
