const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf-8');

const enterpriseTables = `
      CREATE TABLE IF NOT EXISTS branches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL, -- e.g. "Size L, Red"
        sku VARCHAR(255),
        price REAL, -- optional override
        stock_quantity INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS product_batches (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        batch_number VARCHAR(255),
        expiry_date TIMESTAMP,
        stock_quantity INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        promo_type VARCHAR(50), -- 'BOGO', 'PERCENT_OFF'
        buy_product_id INTEGER,
        get_product_id INTEGER,
        discount_percent REAL,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS payroll (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        staff_id INTEGER,
        period_start TIMESTAMP,
        period_end TIMESTAMP,
        hours_worked REAL,
        commission_earned REAL,
        total_payment REAL,
        status VARCHAR(50) DEFAULT 'PAID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
`;

server = server.replace(/CREATE TABLE IF NOT EXISTS products \(/, enterpriseTables + '\n      CREATE TABLE IF NOT EXISTS products (');

// Add new columns to products
if (!server.includes('wholesale_price REAL')) {
    server = server.replace(/price REAL NOT NULL,/, 'price REAL NOT NULL,\n        wholesale_price REAL DEFAULT 0,\n        is_bundle BOOLEAN DEFAULT false,\n        commission_rate REAL DEFAULT 0,');
}

// Add store credit to customers
if (!server.includes('store_credit REAL')) {
    server = server.replace(/loyalty_points INTEGER DEFAULT 0,/, 'loyalty_points INTEGER DEFAULT 0,\n        store_credit REAL DEFAULT 0,');
}

fs.writeFileSync('server.ts', server);
console.log("Enterprise schema patched.");
