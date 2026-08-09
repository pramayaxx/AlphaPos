const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const prodPost = `
app.post('/api/products', authenticateToken, async (req: any, res) => {
  try {
    const p = req.body;
    
    // Check for duplicates
    if (p.item_number) {
      const existingBarcode = await sql\`SELECT * FROM products WHERE user_id = \${req.user.tenantId} AND item_number = \${p.item_number}\`;
      if (existingBarcode.length > 0) {
        return res.status(400).json({ message: 'Product with this barcode already exists' });
      }
    }
    
    const existingName = await sql\`SELECT * FROM products WHERE user_id = \${req.user.tenantId} AND LOWER(name) = LOWER(\${p.name})\`;
    if (existingName.length > 0) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    const products = await sql\`
      INSERT INTO products (user_id, item_number, name, category, price, stock_quantity, low_stock_threshold, image_url, discount_value, discount_type)
      VALUES (\${req.user.tenantId}, \${p.item_number}, \${p.name}, \${p.category}, \${p.price}, \${p.stock_quantity}, \${p.low_stock_threshold}, \${p.image_url}, \${p.discount_value}, \${p.discount_type})
      RETURNING *
    \`;
    res.json(products[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
`;

code = code.replace(/app\.post\('\/api\/products', authenticateToken, async \(req: any, res\) => \{[\s\S]*?res\.json\(products\[0\]\);\s*\} catch \(err: any\) \{\s*res\.status\(500\)\.json\(\{ message: err\.message \}\);\s*\}\s*\}\);/, prodPost.trim());

const customerPost = `
app.post('/api/customers', authenticateToken, async (req: any, res) => {
  try {
    const c = req.body;
    
    // Check for duplicates
    if (c.phone) {
      const existingPhone = await sql\`SELECT * FROM customers WHERE user_id = \${req.user.tenantId} AND phone = \${c.phone}\`;
      if (existingPhone.length > 0) {
        return res.status(400).json({ message: 'Customer with this phone number already exists' });
      }
    }
    
    if (c.email) {
       const existingEmail = await sql\`SELECT * FROM customers WHERE user_id = \${req.user.tenantId} AND email = \${c.email}\`;
       if (existingEmail.length > 0) {
         return res.status(400).json({ message: 'Customer with this email already exists' });
       }
    }

    const customers = await sql\`
      INSERT INTO customers (user_id, name, phone, email)
      VALUES (\${req.user.tenantId}, \${c.name}, \${c.phone}, \${c.email})
      RETURNING *
    \`;
    res.json(customers[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
`;

code = code.replace(/app\.post\('\/api\/customers', authenticateToken, async \(req: any, res\) => \{[\s\S]*?res\.json\(customers\[0\]\);\s*\} catch \(err: any\) \{\s*res\.status\(500\)\.json\(\{ message: err\.message \}\);\s*\}\s*\}\);/, customerPost.trim());

fs.writeFileSync('server.ts', code);
