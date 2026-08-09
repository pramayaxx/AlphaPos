const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf-8');

const restTables = `
      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED
        capacity INTEGER DEFAULT 4
      );

      CREATE TABLE IF NOT EXISTS kds_orders (
        id SERIAL PRIMARY KEY,
        bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
        table_id INTEGER REFERENCES restaurant_tables(id),
        status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PREPARING, READY, SERVED
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
`;

if (!server.includes('restaurant_tables')) {
  server = server.replace(/CREATE TABLE IF NOT EXISTS payroll \([\s\S]*?\);/, match => match + '\n' + restTables);
  fs.writeFileSync('server.ts', server);
  console.log("Restaurant schema patched.");
}
