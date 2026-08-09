const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf-8');

const enterprise3Tables = `
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'CASHIER',
        pin VARCHAR(10) DEFAULT '1234',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
`;

server = server.replace(/CREATE TABLE IF NOT EXISTS returns \([\s\S]*?\);/, match => match + '\n    await sql`\n' + enterprise3Tables + '\n    `;');

// Add columns to users table
const addUsersColumns = `
    try { await sql\`ALTER TABLE users ADD COLUMN package_type VARCHAR(50) DEFAULT 'PRO'\`; } catch(e) {}
    try { await sql\`ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE'\`; } catch(e) {}
    try { await sql\`ALTER TABLE users ADD COLUMN next_billing_date TIMESTAMP\`; } catch(e) {}
    try { await sql\`ALTER TABLE users ADD COLUMN is_superadmin BOOLEAN DEFAULT false\`; } catch(e) {}
`;

if (!server.includes('ALTER TABLE users ADD COLUMN package_type')) {
    server = server.replace(/try \{ await sql\`ALTER TABLE users ADD COLUMN owner_id/, addUsersColumns + '\n    try { await sql`ALTER TABLE users ADD COLUMN owner_id');
}

fs.writeFileSync('server.ts', server);
console.log("Enterprise Part 3 schema patched.");
