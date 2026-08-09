const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf-8');

const enterprise2Tables = `
      CREATE TABLE IF NOT EXISTS shifts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        staff_id INTEGER,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        starting_cash REAL DEFAULT 0,
        ending_cash REAL,
        expected_cash REAL,
        status VARCHAR(50) DEFAULT 'OPEN'
      );

      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        raw_material_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity_needed REAL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        customer_id INTEGER REFERENCES customers(id),
        amount REAL,
        paid_amount REAL DEFAULT 0,
        due_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'UNPAID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
`;

server = server.replace(/CREATE TABLE IF NOT EXISTS kds_orders \([\s\S]*?\);/, match => match + '\n' + enterprise2Tables);

// Add role and pin to staff
if (!server.includes('role VARCHAR(50)')) {
    server = server.replace(/phone VARCHAR\(50\)/, "phone VARCHAR(50),\n        role VARCHAR(50) DEFAULT 'CASHIER',\n        pin VARCHAR(10) DEFAULT '1234'");
}

fs.writeFileSync('server.ts', server);
console.log("Enterprise Part 2 schema patched.");
