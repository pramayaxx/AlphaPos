const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');

const oldInitDb = /async function initDb\(\) \{[\s\S]*?async function startServer\(\)/;
const newInitDb = `async function initDb() {
  try {
    try { await sql\`ALTER TABLE users ADD COLUMN package_type VARCHAR(50) DEFAULT 'PRO'\`; } catch(e) {}
    try { await sql\`ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE'\`; } catch(e) {}
    try { await sql\`ALTER TABLE users ADD COLUMN next_billing_date TIMESTAMP\`; } catch(e) {}
    try { await sql\`ALTER TABLE users ADD COLUMN is_superadmin BOOLEAN DEFAULT false\`; } catch(e) {}
    try { await sql\`ALTER TABLE users ADD COLUMN owner_id INTEGER REFERENCES users(id)\`; } catch(e) {}
    
    await sql.unsafe(\`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    \`);
    
    await sql.unsafe(\`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id),
        item_number VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price NUMERIC(10, 2) DEFAULT 0,
        stock_quantity INTEGER DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 5,
        image_url TEXT,
        discount_value NUMERIC(10, 2) DEFAULT 0,
        discount_type VARCHAR(20) DEFAULT 'amount',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    \`);
    
    await sql.unsafe(\`
      CREATE TABLE IF NOT EXISTS branches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(255),
        price REAL,
        stock_quantity INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS product_batches (
        id SERIAL PRIMARY KEY,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        batch_number VARCHAR(255),
        expiry_date TIMESTAMP,
        stock_quantity INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        promo_type VARCHAR(50),
        buy_product_id UUID,
        get_product_id UUID,
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

      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'AVAILABLE',
        capacity INTEGER DEFAULT 4
      );

      CREATE TABLE IF NOT EXISTS bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id),
        uuid VARCHAR(255) UNIQUE NOT NULL,
        date_time TIMESTAMP NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL,
        discount NUMERIC(10, 2) DEFAULT 0,
        discount_type VARCHAR(50),
        discount_value NUMERIC(10, 2) DEFAULT 0,
        tax_amount NUMERIC(10, 2) DEFAULT 0,
        tax_rate NUMERIC(10, 2) DEFAULT 0,
        grand_total NUMERIC(10, 2) NOT NULL,
        is_printed BOOLEAN DEFAULT false,
        created_by INTEGER REFERENCES users(id),
        customer_id INTEGER,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'paid'
      );

      CREATE TABLE IF NOT EXISTS kds_orders (
        id SERIAL PRIMARY KEY,
        bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
        table_id INTEGER REFERENCES restaurant_tables(id),
        status VARCHAR(50) DEFAULT 'PENDING',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        raw_material_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        quantity_needed REAL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        loyalty_points INTEGER DEFAULT 0,
        store_credit NUMERIC(10, 2) DEFAULT 0,
        total_debt NUMERIC(10, 2) DEFAULT 0
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

      CREATE TABLE IF NOT EXISTS shop_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) UNIQUE,
        name VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        receipt_footer TEXT,
        tax_rate NUMERIC(10, 2) DEFAULT 0
      );
    \`);
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

async function startServer()`;

code = code.replace(oldInitDb, newInitDb);
fs.writeFileSync('server.ts', code);
console.log("Fixed initDb completely.");
