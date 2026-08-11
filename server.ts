import express from 'express';

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123'); // Dummy key if not set

import PDFDocument from 'pdfkit';
import path from 'path';

import postgres from 'postgres';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 3000;
app.use(express.json());

let dbInitialized = false;

app.use(async (req, res, next) => {
  if ((process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL || process.env.DATABASE) && !dbInitialized && process.env.VERCEL) {
    try {
      await initDb();
      dbInitialized = true;
    } catch (e) {
      console.error('Failed to init DB on Vercel:', e);
    }
  }
  next();
});

const dbUrl = process.env.VITE_XATA_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL || process.env.DATABASE || 'postgresql://user:pass@host/db';
let sql: any;
try {
  const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
  sql = postgres(dbUrl, { ssl: isLocal ? false : 'require', connect_timeout: 15 });
} catch(e) {
  console.error('Invalid DB URL:', e);
  sql = postgres('postgresql://user:pass@host/db');
}
const JWT_SECRET = process.env.JWT_SECRET || 'secret';




app.get('/api/public/bills/:uuid', async (req, res) => {
  try {
    const bills = await sql`SELECT * FROM bills WHERE uuid = ${req.params.uuid}`;
    if (bills.length === 0) return res.status(404).json({ error: 'Bill not found' });
    const bill = bills[0];
    const items = await sql`SELECT * FROM bill_items WHERE bill_id = ${bill.id}`;
    const settings = await sql`SELECT * FROM shop_settings WHERE user_id = ${bill.user_id}`;
    const shop = settings.length > 0 ? settings[0] : null;

    
    
    const mappedBill = {
      ...bill,
      dateTime: bill.date_time,
      discountType: bill.discount_type,
      discountValue: Number(bill.discount_value),
      subtotal: Number(bill.subtotal),
      discount: Number(bill.discount),
      grandTotal: Number(bill.grand_total || bill.grandTotal),
      isPrinted: bill.is_printed,
      taxAmount: Number(bill.tax_amount) || 0,
      taxRate: Number(bill.tax_rate) || 0,
      customerId: bill.customer_id,
      paymentMethod: bill.payment_method || 'cash',
      status: bill.status || 'paid',
      items: items.map((i) => ({
        ...i,
        price: Number(i.price)
      }))
    };
    
    let mappedSettings = null;
    if (shop) {
      mappedSettings = {
        name: shop.name,
        address: shop.address,
        phone: shop.phone,
        receiptHeader: shop.receipt_header,
        receiptFooter: shop.receipt_footer,
        receiptFontSize: shop.receipt_font_size,
        receiptWidth: shop.receipt_width,
        receiptPaperSize: shop.receipt_paper_size,
        showStoreName: shop.show_store_name,
        showStoreDetails: shop.show_store_details,
        showAddress: shop.show_address,
        showPhone: shop.show_phone,
        showInvoiceNumber: shop.show_invoice_number,
        showDateTime: shop.show_date_time,
        taxRate: shop.tax_rate,
        taxName: shop.tax_name
      };
    } else {
      mappedSettings = {
        name: 'Alpha Store',
        address: '123 Main St, City',
        phone: '555-0123',
        receiptHeader: 'Welcome to Alpha Store',
        receiptFooter: 'Thank you for shopping with us!',
        receiptFontSize: 14,
        receiptWidth: 58,
        receiptPaperSize: '58mm',
        showStoreName: true,
        showStoreDetails: true,
        showAddress: true,
        showPhone: true,
        showInvoiceNumber: true,
        showDateTime: true,
        taxRate: 0,
        taxName: 'Tax'
      };
    }

    res.json({
      bill: mappedBill,
      settings: mappedSettings
    });


  } catch (err) {
    console.error('SERVER ERROR IN PUBLIC BILLS:', err);
    res.status(500).json({ error: 'Server Error', details: String(err) });
  }
});

app.get('/api/public/bills/:uuid/pdf', async (req, res) => {
  try {
    const bills = await sql`SELECT * FROM bills WHERE uuid = ${req.params.uuid}`;
    if (bills.length === 0) return res.status(404).send('Bill not found');
    const bill = bills[0];
    const items = await sql`SELECT * FROM bill_items WHERE bill_id = ${bill.id}`;
    const settings = await sql`SELECT * FROM shop_settings WHERE user_id = ${bill.user_id}`;
    const shop = settings.length > 0 ? settings[0] : null;

    const doc = new PDFDocument({ margin: 30, size: [250, 600] });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="bill-${bill.uuid}.pdf"`);
    doc.pipe(res);

    // Shop Name
    if (shop?.name) {
      doc.fontSize(16).text(shop.name, { align: 'center' });
    } else {
      doc.fontSize(16).text('Receipt', { align: 'center' });
    }
    
    if (shop?.address) doc.fontSize(10).text(shop.address, { align: 'center' });
    if (shop?.phone) doc.fontSize(10).text('Tel: ' + shop.phone, { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(10).text(`Bill No: ${bill.uuid}`);
    doc.text(`Date: ${new Date(bill.date_time).toLocaleString()}`);
    doc.moveDown();

    doc.text('-----------------------------------------');
    items.forEach(item => {
      doc.text(`${item.name}`);
      doc.text(`${item.quantity} x Rs ${item.price} = Rs ${(item.quantity * item.price).toFixed(2)}`, { align: 'right' });
    });
    doc.text('-----------------------------------------');
    doc.moveDown();

    doc.text(`Subtotal: Rs ${bill.subtotal}`, { align: 'right' });
    if (bill.discount_value > 0) {
      const distText = bill.discount_type === 'percentage' ? `${bill.discount_value}%` : `Rs ${bill.discount_value}`;
      doc.text(`Discount: ${distText}`, { align: 'right' });
    }
    if (bill.tax_amount > 0) {
      doc.text(`Tax: Rs ${bill.tax_amount}`, { align: 'right' });
    }
    doc.fontSize(12).text(`Total: Rs ${bill.grand_total || bill.grandTotal}`, { align: 'right' });
    
    doc.moveDown();
    doc.fontSize(10).text('Thank you for your business!', { align: 'center' });
    if (shop?.footer_message) {
      doc.text(shop.footer_message, { align: 'center' });
    }

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Init DB

async function initDb() {
  try {
    
    try { await sql.unsafe(`ALTER TABLE users ADD COLUMN package_type VARCHAR(50) DEFAULT 'PRO'`); } catch(e) {}
    try { await sql.unsafe(`ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE'`); } catch(e) {}
    try { await sql.unsafe(`ALTER TABLE users ADD COLUMN next_billing_date TIMESTAMP`); } catch(e) {}
    try { await sql.unsafe(`ALTER TABLE users ADD COLUMN is_superadmin BOOLEAN DEFAULT false`); } catch(e) {}

    try { await sql.unsafe(`ALTER TABLE users ADD COLUMN owner_id INTEGER REFERENCES users(id)`); } catch(e) {}
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await sql.unsafe(`
      
      CREATE TABLE IF NOT EXISTS branches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL, -- e.g. "Size L, Red"
        sku VARCHAR(255),
        price REAL, -- optional override
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

      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED
        capacity INTEGER DEFAULT 4
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
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id),
        uuid VARCHAR(100) NOT NULL,
        date_time TIMESTAMP NOT NULL,
        subtotal NUMERIC(10, 2) DEFAULT 0,
        discount NUMERIC(10, 2) DEFAULT 0,
        discount_type VARCHAR(20) DEFAULT 'amount',
        discount_value NUMERIC(10, 2) DEFAULT 0,
        grand_total NUMERIC(10, 2) DEFAULT 0,
        is_printed BOOLEAN DEFAULT false,
        tax_amount NUMERIC(10, 2) DEFAULT 0,
        tax_rate NUMERIC(10, 2) DEFAULT 0,
        customer_id VARCHAR(100),
        payment_method VARCHAR(50) DEFAULT 'cash',
        status VARCHAR(50) DEFAULT 'paid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add columns if missing (migration)
    try { await sql.unsafe(`ALTER TABLE bills ADD COLUMN tax_amount NUMERIC(10, 2) DEFAULT 0`); } catch (e) {}
    try { await sql`ALTER TABLE bills ADD COLUMN tax_rate NUMERIC(10, 2) DEFAULT 0`; } catch (e) {}
    try { await sql`ALTER TABLE bills ADD COLUMN customer_id VARCHAR(100)`; } catch (e) {}
    try { await sql`ALTER TABLE bills ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cash'`; } catch (e) {}
    try { await sql`ALTER TABLE bills ADD COLUMN status VARCHAR(50) DEFAULT 'paid'`; } catch (e) {}

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS bill_items (
        id SERIAL PRIMARY KEY,
        bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
        product_id VARCHAR(100),
        item_number VARCHAR(100),
        name VARCHAR(255),
        quantity INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS shop_settings (
        user_id INTEGER PRIMARY KEY REFERENCES users(id),
        name VARCHAR(255),
        address TEXT,
        phone VARCHAR(50),
        receipt_header TEXT,
        receipt_footer TEXT,
        receipt_font_size INTEGER DEFAULT 14,
        receipt_width INTEGER DEFAULT 58,
        receipt_paper_size VARCHAR(20) DEFAULT '58mm',
        show_store_name BOOLEAN DEFAULT true,
        show_store_details BOOLEAN DEFAULT true,
        show_address BOOLEAN DEFAULT true,
        show_phone BOOLEAN DEFAULT true,
        show_invoice_number BOOLEAN DEFAULT true,
        show_date_time BOOLEAN DEFAULT true,
        sync_provider VARCHAR(50) DEFAULT 'none',
        live_sync BOOLEAN DEFAULT false,
        tax_rate NUMERIC(5, 2) DEFAULT 0,
        tax_name VARCHAR(50) DEFAULT 'Tax'
      )
    `);

    try { await sql`ALTER TABLE shop_settings ADD COLUMN tax_rate NUMERIC(5, 2) DEFAULT 0`; } catch (e) {}
    try { await sql`ALTER TABLE shop_settings ADD COLUMN tax_name VARCHAR(50) DEFAULT 'Tax'`; } catch (e) {}

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        loyalty_points INTEGER DEFAULT 0,
        store_credit REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
      await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id)`;
      await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cash'`;
      await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0`;
      await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(10, 2) DEFAULT 0`;
      await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'paid'`;

      await sql`ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(10, 2) DEFAULT 0`;
      
      await sql`ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS tax_name VARCHAR(50) DEFAULT 'Tax'`;
    } catch(e) {
      console.warn("Alter table error (ignorable if columns exist):", e);
    }
    
    // Add debt to customers
    try { await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_debt NUMERIC(10, 2) DEFAULT 0`; } catch (e) {}

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS customer_payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        customer_id INTEGER REFERENCES customers(id),
        amount NUMERIC(10, 2),
        date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        description VARCHAR(255),
        amount NUMERIC(10, 2),
        date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        category VARCHAR(100)
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        supplier_id INTEGER REFERENCES suppliers(id),
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        cost_price NUMERIC(10, 2),
        status VARCHAR(50) DEFAULT 'received',
        date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS cash_shifts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        opened_by VARCHAR(255) NOT NULL,
        closed_by VARCHAR(255),
        opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP,
        opening_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
        closing_balance NUMERIC(10, 2),
        expected_balance NUMERIC(10, 2),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'open'
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        code VARCHAR(50) NOT NULL,
        discount_type VARCHAR(20) NOT NULL,
        discount_value NUMERIC(10, 2) NOT NULL,
        min_purchase NUMERIC(10, 2) DEFAULT 0,
        valid_until TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        staff_id INTEGER REFERENCES users(id),
        staff_name VARCHAR(255) NOT NULL,
        clock_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        clock_out TIMESTAMP,
        notes TEXT
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS stock_adjustments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id UUID REFERENCES products(id),
        product_name VARCHAR(255),
        change_amount INTEGER NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS gift_cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        code VARCHAR(50) NOT NULL,
        balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        uuid VARCHAR(255) NOT NULL,
        customer_id VARCHAR(255),
        date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        items JSONB NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL,
        discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
        discount_type VARCHAR(20) DEFAULT 'percent',
        discount_value NUMERIC(10, 2) DEFAULT 0,
        tax_amount NUMERIC(10, 2) DEFAULT 0,
        tax_rate NUMERIC(10, 2) DEFAULT 0,
        grand_total NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending'
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        po_number VARCHAR(50) NOT NULL,
        supplier_id INTEGER REFERENCES suppliers(id),
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expected_date TIMESTAMP,
        items JSONB NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT
      )
    `);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS returns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        bill_id UUID REFERENCES bills(id),
        return_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        items JSONB NOT NULL,
        refund_amount NUMERIC(10, 2) NOT NULL,
        reason TEXT
      )
    `);







    
    
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS table_reservations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        table_id INTEGER REFERENCES restaurant_tables(id),
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        reservation_time TIMESTAMP,
        guest_count INTEGER,
        status VARCHAR(20) DEFAULT 'pending'
      )
    `);
    
    try { await sql`ALTER TABLE shop_settings ADD COLUMN enable_loyalty_tiers BOOLEAN DEFAULT false`; } catch (e) {}
    try { await sql`ALTER TABLE shop_settings ADD COLUMN scale_integration BOOLEAN DEFAULT false`; } catch (e) {}
    try { await sql`ALTER TABLE shop_settings ADD COLUMN barcode_scanner_mode BOOLEAN DEFAULT false`; } catch (e) {}
    try { await sql`ALTER TABLE staff ADD COLUMN permissions JSONB DEFAULT '{}'::jsonb`; } catch (e) {}

    console.log('Database tables verified.');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'CASHIER',
        pin VARCHAR(10) DEFAULT '1234',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

    `);
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};


// --- Staff Routes ---
app.get('/api/staff', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.id !== req.user.tenantId) {
      return res.status(403).json({ message: 'Only admins can view staff' });
    }
    const staff = await sql`SELECT id, email, full_name as "fullName", role FROM users WHERE owner_id = ${req.user.id}`;
    res.json(staff);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/staff', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.id !== req.user.tenantId) {
      return res.status(403).json({ message: 'Only admins can add staff' });
    }
    const { email, password, fullName, role } = req.body;
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });

    let is_superadmin = false; const adminCheck = await sql`SELECT COUNT(*) FROM users WHERE is_superadmin = true`; if (parseInt(adminCheck[0].count) === 0) { is_superadmin = true; }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await sql`
      INSERT INTO users (email, password, full_name, role, owner_id) 
      VALUES (${email}, ${hashedPassword}, ${fullName}, ${role || 'cashier'}, ${req.user.id})
      RETURNING id, email, full_name, role
    `;
    res.json(user[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/staff/:id', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.id !== req.user.tenantId) {
      return res.status(403).json({ message: 'Only admins can delete staff' });
    }
    await sql`DELETE FROM users WHERE id = ${req.params.id} AND owner_id = ${req.user.id}`;
    res.json({ message: 'Staff deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await sql`
      INSERT INTO users (email, password, full_name, role, is_superadmin) 
      VALUES (${email}, ${hashedPassword}, ${fullName}, ${role || 'admin'})
      RETURNING id, email, full_name, role
    `;
    res.json(user[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, tenantId: user.owner_id || user.id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const users = await sql`SELECT id, email, full_name as "fullName", role, is_superadmin, package_type, status FROM users WHERE id = ${req.user.id}`;
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(users[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const { fullName } = req.body;
    const users = await sql`
      UPDATE users SET full_name = ${fullName} WHERE id = ${req.user.id}
      RETURNING id, email, full_name as "fullName", role
    `;
    res.json(users[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Products Routes ---
app.get('/api/products', authenticateToken, async (req: any, res) => {
  try {
    const products = await sql`SELECT * FROM products WHERE user_id = ${req.user.tenantId}`;
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/products', authenticateToken, async (req: any, res) => {
  try {
    const p = req.body;
    
    // Check for duplicates
    if (p.item_number) {
      const existingBarcode = await sql`SELECT * FROM products WHERE user_id = ${req.user.tenantId} AND item_number = ${p.item_number}`;
      if (existingBarcode.length > 0) {
        return res.status(400).json({ message: 'Product with this barcode already exists' });
      }
    }
    
    const existingName = await sql`SELECT * FROM products WHERE user_id = ${req.user.tenantId} AND LOWER(name) = LOWER(${p.name})`;
    if (existingName.length > 0) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    const products = await sql`
      INSERT INTO products (user_id, item_number, name, category, price, stock_quantity, low_stock_threshold, image_url, discount_value, discount_type)
      VALUES (${req.user.tenantId}, ${p.item_number}, ${p.name}, ${p.category}, ${p.price}, ${p.stock_quantity}, ${p.low_stock_threshold}, ${p.image_url}, ${p.discount_value}, ${p.discount_type})
      RETURNING *
    `;
    res.json(products[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/products/:id', authenticateToken, async (req: any, res) => {
  try {
    const p = req.body;
    const products = await sql`
      UPDATE products SET
        item_number = ${p.item_number},
        name = ${p.name},
        category = ${p.category},
        price = ${p.price},
        stock_quantity = ${p.stock_quantity},
        low_stock_threshold = ${p.low_stock_threshold},
        image_url = ${p.image_url},
        discount_value = ${p.discount_value},
        discount_type = ${p.discount_type}
      WHERE id = ${req.params.id} AND user_id = ${req.user.tenantId}
      RETURNING *
    `;
    res.json(products[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req: any, res) => {
  try {
    await sql`DELETE FROM products WHERE id = ${req.params.id} AND user_id = ${req.user.tenantId}`;
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Customers Routes ---
app.get('/api/customers', authenticateToken, async (req: any, res) => {
  try {
    const customers = await sql`SELECT id, name, phone, email, loyalty_points, COALESCE(total_debt, 0) as total_debt FROM customers WHERE user_id = ${req.user.tenantId} ORDER BY name ASC`;
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/customers', authenticateToken, async (req: any, res) => {
  try {
    const c = req.body;
    
    // Check for duplicates
    if (c.phone) {
      const existingPhone = await sql`SELECT id, name, phone, email, loyalty_points, COALESCE(total_debt, 0) as total_debt FROM customers WHERE user_id = ${req.user.tenantId} AND phone = ${c.phone}`;
      if (existingPhone.length > 0) {
        return res.status(400).json({ message: 'Customer with this phone number already exists' });
      }
    }
    
    if (c.email) {
       const existingEmail = await sql`SELECT id, name, phone, email, loyalty_points, COALESCE(total_debt, 0) as total_debt FROM customers WHERE user_id = ${req.user.tenantId} AND email = ${c.email}`;
       if (existingEmail.length > 0) {
         return res.status(400).json({ message: 'Customer with this email already exists' });
       }
    }

    const customers = await sql`
      INSERT INTO customers (user_id, name, phone, email)
      VALUES (${req.user.tenantId}, ${c.name}, ${c.phone}, ${c.email})
      RETURNING *
    `;
    res.json(customers[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Bills Routes ---
app.get('/api/bills', authenticateToken, async (req: any, res) => {
  try {
    const bills = await sql`SELECT * FROM bills WHERE user_id = ${req.user.tenantId} ORDER BY date_time DESC`;
    
    // Fetch items for each bill
    for (const b of bills) {
      b.items = await sql`SELECT * FROM bill_items WHERE bill_id = ${b.id}`;
      // Map db fields to client fields
      b.dateTime = b.date_time;
      b.discountType = b.discount_type;
      b.discountValue = Number(b.discount_value);
      b.subtotal = Number(b.subtotal);
      b.discount = Number(b.discount);
      b.grandTotal = Number(b.grand_total);
      b.isPrinted = b.is_printed;
      b.taxAmount = Number(b.tax_amount) || 0;
      b.taxRate = Number(b.tax_rate) || 0;
      b.customerId = b.customer_id;
      b.paymentMethod = b.payment_method || 'cash';
      b.status = b.status || 'paid';
      
      b.items = b.items.map((i: any) => ({
        ...i,
        price: Number(i.price)
      }));
    }
    res.json(bills);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/bills', authenticateToken, async (req: any, res) => {
  try {
    const b = req.body;
    
    // 1. Process cart items (reduce stock)
    for (const item of b.items) {
      if (item.product_id && !item.product_id.startsWith('CUSTOM-')) {
        await sql`
          UPDATE products 
          SET stock_quantity = GREATEST(0, stock_quantity - ${item.quantity})
          WHERE id = ${item.product_id} AND user_id = ${req.user.tenantId}
        `;
      }
    }

    const bills = await sql`
      INSERT INTO bills (user_id, uuid, date_time, subtotal, discount, discount_type, discount_value, grand_total, is_printed, customer_id, payment_method, tax_amount, tax_rate, status)
      VALUES (${req.user.tenantId}, ${b.uuid}, ${b.dateTime}, ${b.subtotal}, ${b.discount}, ${b.discountType}, ${b.discountValue}, ${b.grandTotal}, ${b.isPrinted}, ${b.customerId || null}, ${b.paymentMethod || 'cash'}, ${b.taxAmount || 0}, ${b.taxRate || 0}, ${b.status || 'paid'})
      RETURNING *
    `;
    
    const savedBill = bills[0];

    if (b.paymentMethod === 'credit' && b.customerId) {
      await sql`
        UPDATE customers
        SET total_debt = COALESCE(total_debt, 0) + ${b.grandTotal}
        WHERE id = ${b.customerId} AND user_id = ${req.user.tenantId}
      `;
    }

    if (b.customerId && (b.pointsEarned || b.pointsRedeemed)) {
      const earned = b.pointsEarned || 0;
      const redeemed = b.pointsRedeemed || 0;
      await sql`
        UPDATE customers
        SET loyalty_points = GREATEST(0, COALESCE(loyalty_points, 0) + ${earned} - ${redeemed})
        WHERE id = ${b.customerId} AND user_id = ${req.user.tenantId}
      `;
    }


    for (const item of b.items) {
      await sql`
        INSERT INTO bill_items (bill_id, product_id, item_number, name, quantity, price)
        VALUES (${savedBill.id}, ${item.product_id}, ${item.item_number}, ${item.name}, ${item.quantity}, ${item.price})
      `;
    }

    savedBill.items = b.items;
    savedBill.dateTime = savedBill.date_time;
    savedBill.discountType = savedBill.discount_type;
    savedBill.discountValue = Number(savedBill.discount_value);
    savedBill.subtotal = Number(savedBill.subtotal);
    savedBill.discount = Number(savedBill.discount);
    savedBill.grandTotal = Number(savedBill.grand_total);
    savedBill.isPrinted = savedBill.is_printed;
    savedBill.taxAmount = Number(savedBill.tax_amount);
    savedBill.taxRate = Number(savedBill.tax_rate);
    savedBill.customerId = savedBill.customer_id;
    savedBill.paymentMethod = savedBill.payment_method;
    savedBill.status = savedBill.status;

    res.json(savedBill);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/bills/:uuid', authenticateToken, async (req: any, res) => {
  try {
    const { isPrinted } = req.body;
    await sql`UPDATE bills SET is_printed = ${isPrinted} WHERE uuid = ${req.params.uuid} AND user_id = ${req.user.tenantId}`;
    res.json({ message: 'Updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/bills/:uuid/refund', authenticateToken, async (req: any, res) => {
  try {
    const bill = await sql`SELECT * FROM bills WHERE uuid = ${req.params.uuid} AND user_id = ${req.user.tenantId}`;
    if (bill.length === 0) return res.status(404).json({ message: "Bill not found" });
    if (bill[0].status === 'refunded') return res.status(400).json({ message: "Already refunded" });
    
    // Add stock back
    const items = await sql`SELECT * FROM bill_items WHERE bill_id = ${bill[0].id}`;
    for (const item of items) {
      if (item.product_id && !item.product_id.startsWith('CUSTOM-')) {
        await sql`
          UPDATE products 
          SET stock_quantity = stock_quantity + ${item.quantity}
          WHERE id = ${item.product_id} AND user_id = ${req.user.tenantId}
        `;
      }
    }
    
    await sql`UPDATE bills SET status = 'refunded' WHERE uuid = ${req.params.uuid} AND user_id = ${req.user.tenantId}`;
    res.json({ message: 'Refund successful' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});






// --- Attendance Routes ---
app.get('/api/attendance', authenticateToken, async (req: any, res) => {
  try {
    const records = await sql`SELECT * FROM attendance WHERE user_id = ${req.user.tenantId} ORDER BY clock_in DESC`;
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/attendance/clock-in', authenticateToken, async (req: any, res) => {
  try {
    const { staff_id, staff_name } = req.body;
    const newRecord = await sql`
      INSERT INTO attendance (user_id, staff_id, staff_name)
      VALUES (${req.user.tenantId}, ${staff_id}, ${staff_name})
      RETURNING *
    `;
    res.json(newRecord[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/attendance/:id/clock-out', authenticateToken, async (req: any, res) => {
  try {
    const recordId = req.params.id;
    const closedRecord = await sql`
      UPDATE attendance 
      SET clock_out = CURRENT_TIMESTAMP 
      WHERE id = ${recordId} AND user_id = ${req.user.tenantId}
      RETURNING *
    `;
    res.json(closedRecord[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


// --- Gift Cards Routes ---
app.get('/api/gift-cards', authenticateToken, async (req: any, res) => {
  try {
    const cards = await sql`SELECT * FROM gift_cards WHERE user_id = ${req.user.tenantId} ORDER BY issued_at DESC`;
    res.json(cards);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/gift-cards', authenticateToken, async (req: any, res) => {
  try {
    const { code, balance } = req.body;
    const newCard = await sql`
      INSERT INTO gift_cards (user_id, code, balance)
      VALUES (${req.user.tenantId}, ${code.toUpperCase()}, ${balance})
      RETURNING *
    `;
    res.json(newCard[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/gift-cards/:id/toggle', authenticateToken, async (req: any, res) => {
  try {
    const cardId = req.params.id;
    const { is_active } = req.body;
    await sql`
      UPDATE gift_cards SET is_active = ${is_active} 
      WHERE id = ${cardId} AND user_id = ${req.user.tenantId}
    `;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


// --- Purchase Orders Routes ---
app.get('/api/purchase-orders', authenticateToken, async (req: any, res) => {
  try {
    const pos = await sql`
      SELECT p.*, s.name as supplier_name 
      FROM purchase_orders p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.user_id = ${req.user.tenantId} 
      ORDER BY p.order_date DESC
    `;
    const formatted = pos.map((p: any) => ({
      ...p,
      items: typeof p.items === 'string' ? JSON.parse(p.items) : p.items
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/purchase-orders', authenticateToken, async (req: any, res) => {
  try {
    const p = req.body;
    const newPO = await sql`
      INSERT INTO purchase_orders (
        user_id, po_number, supplier_id, expected_date, items, total_amount, status, notes
      ) VALUES (
        ${req.user.tenantId}, ${p.po_number}, ${p.supplier_id}, ${p.expected_date || null}, 
        ${JSON.stringify(p.items)}, ${p.total_amount}, 'pending', ${p.notes || null}
      )
      RETURNING *
    `;
    res.json(newPO[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/purchase-orders/:id/receive', authenticateToken, async (req: any, res) => {
  try {
    const poId = req.params.id;
    const po = await sql`SELECT * FROM purchase_orders WHERE id = ${poId} AND user_id = ${req.user.tenantId}`;
    
    if (po.length === 0) {
      return res.status(404).json({ message: 'PO not found' });
    }

    if (po[0].status === 'received') {
      return res.status(400).json({ message: 'PO already received' });
    }

    const items = typeof po[0].items === 'string' ? JSON.parse(po[0].items) : po[0].items;

    // Update stock
    for (const item of items) {
      if (item.product_id) {
        await sql`
          UPDATE products 
          SET stock_quantity = stock_quantity + ${item.quantity}
          WHERE id = ${item.product_id} AND user_id = ${req.user.tenantId}
        `;
      }
    }

    const updated = await sql`
      UPDATE purchase_orders SET status = 'received' 
      WHERE id = ${poId} AND user_id = ${req.user.tenantId}
      RETURNING *
    `;

    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Returns Routes ---
app.get('/api/returns', authenticateToken, async (req: any, res) => {
  try {
    const returns = await sql`
      SELECT r.*, b.uuid as original_bill_uuid
      FROM returns r
      LEFT JOIN bills b ON r.bill_id = b.id
      WHERE r.user_id = ${req.user.tenantId}
      ORDER BY r.return_date DESC
    `;
    const formatted = returns.map((r: any) => ({
      ...r,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/returns', authenticateToken, async (req: any, res) => {
  try {
    const { bill_id, items, refund_amount, reason, restock } = req.body;
    
    // Add return record
    const newReturn = await sql`
      INSERT INTO returns (user_id, bill_id, items, refund_amount, reason)
      VALUES (${req.user.tenantId}, ${bill_id}, ${JSON.stringify(items)}, ${refund_amount}, ${reason})
      RETURNING *
    `;

    if (restock) {
      for (const item of items) {
        if (item.product_id) {
          await sql`
            UPDATE products 
            SET stock_quantity = stock_quantity + ${item.quantity}
            WHERE id = ${item.product_id} AND user_id = ${req.user.tenantId}
          `;
        }
      }
    }

    res.json(newReturn[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Quotes Routes ---
app.get('/api/quotes', authenticateToken, async (req: any, res) => {
  try {
    const quotes = await sql`SELECT * FROM quotes WHERE user_id = ${req.user.tenantId} ORDER BY date_time DESC`;
    const formatted = quotes.map((q: any) => ({
      ...q,
      items: typeof q.items === 'string' ? JSON.parse(q.items) : q.items
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/quotes', authenticateToken, async (req: any, res) => {
  try {
    const q = req.body;
    const newQuote = await sql`
      INSERT INTO quotes (
        user_id, uuid, customer_id, items, subtotal, discount, discount_type, discount_value, tax_amount, tax_rate, grand_total, status
      ) VALUES (
        ${req.user.tenantId}, ${q.uuid}, ${q.customerId || null}, ${JSON.stringify(q.items)}, 
        ${q.subtotal}, ${q.discount}, ${q.discountType}, ${q.discountValue}, 
        ${q.taxAmount || 0}, ${q.taxRate || 0}, ${q.grandTotal}, 'pending'
      )
      RETURNING *
    `;
    res.json(newQuote[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/quotes/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const { status } = req.body;
    const updated = await sql`
      UPDATE quotes SET status = ${status} 
      WHERE id = ${req.params.id} AND user_id = ${req.user.tenantId}
      RETURNING *
    `;
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Stock Adjustments Routes ---
app.get('/api/stock-adjustments', authenticateToken, async (req: any, res) => {
  try {
    const records = await sql`
      SELECT s.*, p.name as current_product_name 
      FROM stock_adjustments s
      LEFT JOIN products p ON s.product_id = p.id
      WHERE s.user_id = ${req.user.tenantId} 
      ORDER BY s.created_at DESC
    `;
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/stock-adjustments', authenticateToken, async (req: any, res) => {
  try {
    const { product_id, product_name, change_amount, reason } = req.body;
    
    // Update product stock
    await sql`
      UPDATE products 
      SET stock_quantity = stock_quantity + ${change_amount}
      WHERE id = ${product_id} AND user_id = ${req.user.tenantId}
    `;

    // Record adjustment
    const newRecord = await sql`
      INSERT INTO stock_adjustments (user_id, product_id, product_name, change_amount, reason)
      VALUES (${req.user.tenantId}, ${product_id}, ${product_name}, ${change_amount}, ${reason})
      RETURNING *
    `;
    
    res.json(newRecord[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Coupons Routes ---
app.get('/api/coupons', authenticateToken, async (req: any, res) => {
  try {
    const coupons = await sql`SELECT * FROM coupons WHERE user_id = ${req.user.tenantId} ORDER BY created_at DESC`;
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/coupons', authenticateToken, async (req: any, res) => {
  try {
    const { code, discount_type, discount_value, min_purchase, valid_until } = req.body;
    const newCoupon = await sql`
      INSERT INTO coupons (user_id, code, discount_type, discount_value, min_purchase, valid_until)
      VALUES (${req.user.tenantId}, ${code.toUpperCase()}, ${discount_type}, ${discount_value}, ${min_purchase}, ${valid_until || null})
      RETURNING *
    `;
    res.json(newCoupon[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/coupons/:id/toggle', authenticateToken, async (req: any, res) => {
  try {
    const couponId = req.params.id;
    const { is_active } = req.body;
    await sql`
      UPDATE coupons SET is_active = ${is_active} 
      WHERE id = ${couponId} AND user_id = ${req.user.tenantId}
    `;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/coupons/validate', authenticateToken, async (req: any, res) => {
  try {
    const { code } = req.body;
    const coupons = await sql`
      SELECT * FROM coupons 
      WHERE user_id = ${req.user.tenantId} 
      AND code = ${code.toUpperCase()} 
      AND is_active = TRUE
    `;
    
    if (coupons.length === 0) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }
    
    const coupon = coupons[0];
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    
    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Cash Shifts Routes ---
app.get('/api/shifts/current', authenticateToken, async (req: any, res) => {
  try {
    const shifts = await sql`SELECT * FROM cash_shifts WHERE user_id = ${req.user.tenantId} AND status = 'open' ORDER BY opened_at DESC LIMIT 1`;
    if (shifts.length > 0) {
      res.json(shifts[0]);
    } else {
      res.json(null);
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/shifts', authenticateToken, async (req: any, res) => {
  try {
    const shifts = await sql`SELECT * FROM cash_shifts WHERE user_id = ${req.user.tenantId} ORDER BY opened_at DESC LIMIT 50`;
    res.json(shifts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/shifts/open', authenticateToken, async (req: any, res) => {
  try {
    const { opening_balance, notes } = req.body;
    const newShift = await sql`
      INSERT INTO cash_shifts (user_id, opened_by, opening_balance, notes, status)
      VALUES (${req.user.tenantId}, ${req.user.username}, ${opening_balance}, ${notes}, 'open')
      RETURNING *
    `;
    res.json(newShift[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/shifts/:id/close', authenticateToken, async (req: any, res) => {
  try {
    const { closing_balance, expected_balance, notes } = req.body;
    const shiftId = req.params.id;
    const closedShift = await sql`
      UPDATE cash_shifts
      SET status = 'closed',
          closed_by = ${req.user.username},
          closed_at = CURRENT_TIMESTAMP,
          closing_balance = ${closing_balance},
          expected_balance = ${expected_balance},
          notes = ${notes}
      WHERE id = ${shiftId} AND user_id = ${req.user.tenantId}
      RETURNING *
    `;
    res.json(closedShift[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Suppliers Routes ---
app.get('/api/suppliers', authenticateToken, async (req: any, res) => {
  try {
    const suppliers = await sql`SELECT * FROM suppliers WHERE user_id = ${req.user.tenantId} ORDER BY name ASC`;
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/suppliers', authenticateToken, async (req: any, res) => {
  try {
    const s = req.body;
    const newSupplier = await sql`
      INSERT INTO suppliers (user_id, name, contact_person, phone, email, address)
      VALUES (${req.user.tenantId}, ${s.name}, ${s.contact_person}, ${s.phone}, ${s.email}, ${s.address})
      RETURNING *
    `;
    res.json(newSupplier[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Purchase Orders ---
app.get('/api/purchases', authenticateToken, async (req: any, res) => {
  try {
    const purchases = await sql`
      SELECT p.*, s.name as supplier_name, pr.name as product_name 
      FROM purchase_orders p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN products pr ON p.product_id = pr.id
      WHERE p.user_id = ${req.user.tenantId} 
      ORDER BY p.date_time DESC
    `;
    res.json(purchases);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/purchases', authenticateToken, async (req: any, res) => {
  try {
    const p = req.body;
    const newPo = await sql`
      INSERT INTO purchase_orders (user_id, supplier_id, product_id, quantity, cost_price, status)
      VALUES (${req.user.tenantId}, ${p.supplier_id}, ${p.product_id}, ${p.quantity}, ${p.cost_price}, 'received')
      RETURNING *
    `;
    
    // Update stock
    if (p.product_id) {
      await sql`
        UPDATE products 
        SET stock_quantity = stock_quantity + ${p.quantity}
        WHERE id = ${p.product_id} AND user_id = ${req.user.tenantId}
      `;
    }
    
    res.json(newPo[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Expenses Routes ---
app.get('/api/expenses', authenticateToken, async (req: any, res) => {
  try {
    const expenses = await sql`SELECT * FROM expenses WHERE user_id = ${req.user.tenantId} ORDER BY date_time DESC`;
    res.json(expenses.map(e => ({...e, date_time: new Date(e.date_time), amount: Number(e.amount)})));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/expenses', authenticateToken, async (req: any, res) => {
  try {
    const { description, amount, category, date_time } = req.body;
    const e = await sql`
      INSERT INTO expenses (user_id, description, amount, category, date_time)
      VALUES (${req.user.tenantId}, ${description}, ${amount}, ${category || 'General'}, ${date_time || new Date()})
      RETURNING *
    `;
    res.json({...e[0], date_time: new Date(e[0].date_time), amount: Number(e[0].amount)});
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Customer Payments ---
app.post('/api/customers/:id/pay', authenticateToken, async (req: any, res) => {
  try {
    const customerId = req.params.id;
    const { amount } = req.body;
    
    await sql`
      INSERT INTO customer_payments (user_id, customer_id, amount)
      VALUES (${req.user.tenantId}, ${customerId}, ${amount})
    `;
    
    const updated = await sql`
      UPDATE customers 
      SET total_debt = GREATEST(0, COALESCE(total_debt, 0) - ${amount})
      WHERE id = ${customerId} AND user_id = ${req.user.tenantId}
      RETURNING *
    `;
    
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Settings Routes ---
app.get('/api/settings', authenticateToken, async (req: any, res) => {
  try {
    const settings = await sql`SELECT * FROM shop_settings WHERE user_id = ${req.user.tenantId}`;
    if (settings.length === 0) {
      // return default
      return res.json({
        name: 'Alpha Store',
        address: '123 Main St, City',
        phone: '555-0123',
        receiptHeader: 'Welcome to Alpha Store',
        receiptFooter: 'Thank you for shopping with us!',
        receiptFontSize: 14,
        receiptWidth: 58,
        receiptPaperSize: '58mm',
        showStoreName: true,
        showStoreDetails: true,
        showAddress: true,
        showPhone: true,
        showInvoiceNumber: true,
        showDateTime: true,
        
        taxRate: 0,
        taxName: 'Tax'
      });
    }
    const s = settings[0];
    res.json({
      name: s.name,
      address: s.address,
      phone: s.phone,
      receiptHeader: s.receipt_header,
      receiptFooter: s.receipt_footer,
      receiptFontSize: s.receipt_font_size,
      receiptWidth: s.receipt_width,
      receiptPaperSize: s.receipt_paper_size,
      showStoreName: s.show_store_name,
      showStoreDetails: s.show_store_details,
      showAddress: s.show_address,
      showPhone: s.show_phone,
      showInvoiceNumber: s.show_invoice_number,
      showDateTime: s.show_date_time,
      
      taxRate: Number(s.tax_rate) || 0,
      taxName: s.tax_name || 'Tax'
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/settings', authenticateToken, async (req: any, res) => {
  try {
    const s = req.body;
    await sql`
      INSERT INTO shop_settings (
        user_id, name, address, phone, receipt_header, receipt_footer, receipt_font_size, receipt_width, receipt_paper_size, show_store_name, show_store_details, show_address, show_phone, show_invoice_number, show_date_time, sync_provider, live_sync, tax_rate, tax_name
      ) VALUES (
        ${req.user.tenantId}, ${s.name}, ${s.address}, ${s.phone}, ${s.receiptHeader}, ${s.receiptFooter}, ${s.receiptFontSize}, ${s.receiptWidth}, ${s.receiptPaperSize}, ${s.showStoreName}, ${s.showStoreDetails}, ${s.showAddress}, ${s.showPhone}, ${s.showInvoiceNumber}, ${s.showDateTime}, 'cloud', true, ${s.taxRate || 0}, ${s.taxName || 'Tax'}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        name = ${s.name}, address = ${s.address}, phone = ${s.phone}, receipt_header = ${s.receiptHeader}, receipt_footer = ${s.receiptFooter}, receipt_font_size = ${s.receiptFontSize}, receipt_width = ${s.receiptWidth}, receipt_paper_size = ${s.receiptPaperSize}, show_store_name = ${s.showStoreName}, show_store_details = ${s.showStoreDetails}, show_address = ${s.showAddress}, show_phone = ${s.showPhone}, show_invoice_number = ${s.showInvoiceNumber}, show_date_time = ${s.showDateTime}, sync_provider = 'cloud', live_sync = true, tax_rate = ${s.taxRate || 0}, tax_name = ${s.taxName || 'Tax'}
    `;
    res.json({ message: 'Settings saved' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


// --- Invoices Routes ---
app.get('/api/invoices', authenticateToken, async (req: any, res) => {
  try {
    const invoices = await sql`SELECT * FROM invoices WHERE user_id = ${req.user.tenantId} ORDER BY date_time DESC`;
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Recipes Routes ---
app.get('/api/recipes', authenticateToken, async (req: any, res) => {
  try {
    const recipes = await sql`SELECT * FROM recipes WHERE user_id = ${req.user.tenantId} ORDER BY id DESC`;
    res.json(recipes);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/recipes', authenticateToken, async (req: any, res) => {
  try {
    const { product_id, raw_material_product_id, quantity } = req.body;
    const recipe = await sql`
      INSERT INTO recipes (user_id, product_id, raw_material_product_id, quantity)
      VALUES (${req.user.tenantId}, ${product_id}, ${raw_material_product_id}, ${quantity})
      RETURNING *
    `;
    res.json(recipe[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Verify PIN Route ---
app.post('/api/verify-pin', authenticateToken, async (req: any, res) => {
  try {
    const { pin } = req.body;
    // For simplicity, check if the pin matches the current user or any superadmin/manager
    const users = await sql`SELECT * FROM users WHERE id = ${req.user.id}`;
    const user = users[0];
    
    // Check against staff table or user table?
    const staff = await sql`SELECT * FROM staff WHERE user_id = ${req.user.tenantId} AND pin = ${pin}`;
    
    if (staff.length > 0) {
      res.json({ success: true, role: staff[0].role, user: staff[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid PIN' });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


// --- Reservations Routes ---
app.get('/api/reservations', authenticateToken, async (req: any, res) => {
  try {
    const reservations = await sql`SELECT * FROM table_reservations WHERE user_id = ${req.user.tenantId} ORDER BY reservation_time ASC`;
    res.json(reservations);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});
app.post('/api/reservations', authenticateToken, async (req: any, res) => {
  try {
    const { table_id, customer_name, customer_phone, reservation_time, guest_count } = req.body;
    const data = await sql`
      INSERT INTO table_reservations (user_id, table_id, customer_name, customer_phone, reservation_time, guest_count, status)
      VALUES (${req.user.tenantId}, ${table_id}, ${customer_name}, ${customer_phone}, ${reservation_time}, ${guest_count}, 'confirmed')
      RETURNING *
    `;
    res.json(data[0]);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// --- Public Menu & Ordering ---
app.get('/api/public/menu/:tenantId', async (req: any, res) => {
  try {
    const { tenantId } = req.params;
    const products = await sql`SELECT id, name, price, category, item_number, image_url FROM products WHERE user_id = ${tenantId}`;
    res.json(products);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});
app.post('/api/public/orders/:tenantId', async (req: any, res) => {
  try {
    const { tenantId } = req.params;
    const { items, customer_name, customer_phone, total_amount, order_type } = req.body; // order_type = 'online'
    
    // Create Bill
    const bills = await sql`
      INSERT INTO bills (user_id, uuid, date_time, grand_total, status, order_type, customer_name, customer_phone)
      VALUES (${tenantId}, gen_random_uuid(), NOW(), ${total_amount}, 'pending', ${order_type || 'online'}, ${customer_name}, ${customer_phone})
      RETURNING *
    `;
    const bill = bills[0];
    
    
    res.json({ success: true, bill });
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});
export default app;



async function startServer() {
  if (process.env.VERCEL) return;
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL || process.env.DATABASE) {
    await initDb();
  }

  app.post('/api/bills/:uuid/send-receipt', authenticateToken, async (req: any, res) => {
  const { uuid } = req.params;
  const { email, phone } = req.body;
  try {
    const billRes = await sql`SELECT * FROM bills WHERE uuid = ${uuid} AND user_id = ${req.user.tenantId}`;
    if (billRes.length === 0) return res.status(404).json({ error: 'Bill not found' });
    const bill = billRes[0];

    // Mock Email/SMS Send
    console.log(`[NOTIFICATION] Sending receipt for Bill ${uuid} to ${email || phone}`);
    // Example: if using nodemailer
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ to: email, subject: 'Your Receipt', html: '...' });

    res.json({ success: true, message: 'Receipt sent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bills/:uuid/create-payment-link', authenticateToken, async (req: any, res) => {
  const { uuid } = req.params;
  try {
    const billRes = await sql`SELECT * FROM bills WHERE uuid = ${uuid} AND user_id = ${req.user.tenantId}`;
    if (billRes.length === 0) return res.status(404).json({ error: 'Bill not found' });
    const bill = billRes[0];

    // Create a stripe payment link
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Order #${uuid.substring(0,8)}`,
          },
          unit_amount: Math.round(bill.grand_total || bill.grandTotal * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:3000/api/public/bills/${uuid}/success`,
      cancel_url: `http://localhost:3000/api/public/bills/${uuid}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

    
  
// --- Backup Routes ---
app.get('/api/backup/export', authenticateToken, async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const products = await sql`SELECT * FROM products WHERE user_id = ${tenantId}`;
    const customers = await sql`SELECT * FROM customers WHERE user_id = ${tenantId}`;
    const bills = await sql`SELECT * FROM bills WHERE user_id = ${tenantId}`;
    const billItems = await sql`SELECT * FROM bill_items WHERE user_id = ${tenantId}`;
    const expenses = await sql`SELECT * FROM expenses WHERE user_id = ${tenantId}`;
    
    res.json({
      timestamp: new Date().toISOString(),
      products,
      customers,
      bills,
      billItems,
      expenses
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


// --- Enterprise Routes ---
app.get('/api/branches', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql`SELECT * FROM branches WHERE user_id = ${req.user.tenantId}`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/branches', authenticateToken, async (req: any, res) => {
  try {
    const { name, location } = req.body;
    const data = await sql`INSERT INTO branches (user_id, name, location) VALUES (${req.user.tenantId}, ${name}, ${location}) RETURNING *`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.get('/api/variants/:productId', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql`SELECT * FROM product_variants WHERE product_id = ${req.params.productId}`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/variants', authenticateToken, async (req: any, res) => {
  try {
    const { product_id, name, sku, price, stock_quantity } = req.body;
    const data = await sql`INSERT INTO product_variants (product_id, name, sku, price, stock_quantity) VALUES (${product_id}, ${name}, ${sku}, ${price}, ${stock_quantity}) RETURNING *`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.get('/api/promotions', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql`SELECT * FROM promotions WHERE user_id = ${req.user.tenantId}`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/promotions', authenticateToken, async (req: any, res) => {
  try {
    const { name, promo_type, buy_product_id, get_product_id, discount_percent, start_date, end_date, is_active } = req.body;
    const data = await sql`INSERT INTO promotions (user_id, name, promo_type, buy_product_id, get_product_id, discount_percent, start_date, end_date, is_active) 
                           VALUES (${req.user.tenantId}, ${name}, ${promo_type}, ${buy_product_id}, ${get_product_id}, ${discount_percent}, ${start_date}, ${end_date}, ${is_active}) RETURNING *`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.get('/api/payroll', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql`SELECT p.*, s.full_name as staff_name FROM payroll p LEFT JOIN staff s ON p.staff_id = s.id WHERE p.user_id = ${req.user.tenantId} ORDER BY p.created_at DESC`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/payroll', authenticateToken, async (req: any, res) => {
  try {
    const { staff_id, period_start, period_end, hours_worked, commission_earned, total_payment, status } = req.body;
    const data = await sql`INSERT INTO payroll (user_id, staff_id, period_start, period_end, hours_worked, commission_earned, total_payment, status) 
                           VALUES (${req.user.tenantId}, ${staff_id}, ${period_start}, ${period_end}, ${hours_worked}, ${commission_earned}, ${total_payment}, ${status}) RETURNING *`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});


app.get('/api/tables', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql`SELECT * FROM restaurant_tables ORDER BY id ASC`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/tables', authenticateToken, async (req: any, res) => {
  try {
    const { name, capacity } = req.body;
    const data = await sql`INSERT INTO restaurant_tables (name, capacity) VALUES (${name}, ${capacity}) RETURNING *`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.put('/api/tables/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const { status } = req.body;
    await sql`UPDATE restaurant_tables SET status = ${status} WHERE id = ${req.params.id}`;
    res.json({success: true});
  } catch(e: any) { res.status(500).json({message: e.message}); }
});



// --- Enterprise 3 Routes (Super Admin, Staff, Shop Settings) ---
app.get('/api/me', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql`SELECT id, email, full_name, role, package_type, status, next_billing_date, is_superadmin FROM users WHERE id = ${req.user.tenantId}`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

// Super Admin
const requireSuperAdmin = async (req: any, res: any, next: any) => {
  const data = await sql`SELECT is_superadmin FROM users WHERE id = ${req.user.tenantId}`;
  if (data[0]?.is_superadmin) next();
  else res.status(403).json({message: "Super Admin Only"});
};

app.get('/api/superadmin/tenants', authenticateToken, requireSuperAdmin, async (req: any, res) => {
  try {
    const data = await sql`SELECT id, email, full_name, package_type, status, next_billing_date, created_at FROM users WHERE is_superadmin = false ORDER BY created_at DESC`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.post('/api/superadmin/tenants/:id/status', authenticateToken, requireSuperAdmin, async (req: any, res) => {
  try {
    const { status } = req.body;
    await sql`UPDATE users SET status = ${status} WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.post('/api/superadmin/tenants/:id/package', authenticateToken, requireSuperAdmin, async (req: any, res) => {
  try {
    const { package_type } = req.body;
    await sql`UPDATE users SET package_type = ${package_type} WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

app.get('/api/superadmin/stats', authenticateToken, requireSuperAdmin, async (req: any, res) => {
  try {
    const total = await sql`SELECT COUNT(*) FROM users WHERE is_superadmin = false`;
    const active = await sql`SELECT COUNT(*) FROM users WHERE is_superadmin = false AND status = 'ACTIVE'`;
    // Dummy revenue metric
    res.json({ total: total[0].count, active: active[0].count, revenue: parseInt(active[0].count) * 50 });
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

// Staff
app.get('/api/staff', authenticateToken, async (req: any, res) => {
  try {
    const data = await sql`SELECT * FROM staff WHERE user_id = ${req.user.tenantId}`;
    res.json(data);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/staff', authenticateToken, async (req: any, res) => {
  try {
    const { full_name, phone, role, pin } = req.body;
    const data = await sql`INSERT INTO staff (user_id, full_name, phone, role, pin) VALUES (${req.user.tenantId}, ${full_name}, ${phone}, ${role}, ${pin}) RETURNING *`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.delete('/api/staff/:id', authenticateToken, async (req: any, res) => {
  try {
    await sql`DELETE FROM staff WHERE id = ${req.params.id} AND user_id = ${req.user.tenantId}`;
    res.json({success:true});
  } catch(e: any) { res.status(500).json({message: e.message}); }
});

// Shop Settings
app.get('/api/shop-settings', authenticateToken, async (req: any, res) => {
  try {
    let data = await sql`SELECT * FROM shop_settings WHERE user_id = ${req.user.tenantId}`;
    if (data.length === 0) {
       await sql`INSERT INTO shop_settings (user_id, name) VALUES (${req.user.tenantId}, 'My Store')`;
       data = await sql`SELECT * FROM shop_settings WHERE user_id = ${req.user.tenantId}`;
    }
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});
app.post('/api/shop-settings', authenticateToken, async (req: any, res) => {
  try {
    const { name, phone, address, receipt_footer, enable_loyalty_tiers, scale_integration, barcode_scanner_mode } = req.body;
    const data = await sql`UPDATE shop_settings SET 
      name = ${name}, 
      phone = ${phone}, 
      address = ${address}, 
      receipt_footer = ${receipt_footer},
      enable_loyalty_tiers = ${enable_loyalty_tiers !== undefined ? enable_loyalty_tiers : false},
      scale_integration = ${scale_integration !== undefined ? scale_integration : false},
      barcode_scanner_mode = ${barcode_scanner_mode !== undefined ? barcode_scanner_mode : false}
      WHERE user_id = ${req.user.tenantId} RETURNING *`;
    res.json(data[0]);
  } catch(e: any) { res.status(500).json({message: e.message}); }
});



  if (process.env.NODE_ENV !== 'production') {
    try {
      const viteName = 'vite';
      const viteModule = await import(viteName /* @vite-ignore */);
      const createViteServer = viteModule.createServer;
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Vite not found or failed to load, skipping dev server middleware:", e);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) { startServer().catch(console.error); }
