const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const tableInitCode = `
    await sql\`
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
    \`;

    await sql\`
      CREATE TABLE IF NOT EXISTS returns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        bill_id INTEGER REFERENCES bills(id),
        return_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        items JSONB NOT NULL,
        refund_amount NUMERIC(10, 2) NOT NULL,
        reason TEXT
      )
    \`;
`;

code = code.replace(/CREATE TABLE IF NOT EXISTS quotes[\s\S]*?\n    \`;/, match => match + "\n" + tableInitCode);

const newRoutes = `
// --- Purchase Orders Routes ---
app.get('/api/purchase-orders', authenticateToken, async (req: any, res) => {
  try {
    const pos = await sql\`
      SELECT p.*, s.name as supplier_name 
      FROM purchase_orders p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.user_id = \${req.user.tenantId} 
      ORDER BY p.order_date DESC
    \`;
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
    const newPO = await sql\`
      INSERT INTO purchase_orders (
        user_id, po_number, supplier_id, expected_date, items, total_amount, status, notes
      ) VALUES (
        \${req.user.tenantId}, \${p.po_number}, \${p.supplier_id}, \${p.expected_date || null}, 
        \${JSON.stringify(p.items)}, \${p.total_amount}, 'pending', \${p.notes || null}
      )
      RETURNING *
    \`;
    res.json(newPO[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/purchase-orders/:id/receive', authenticateToken, async (req: any, res) => {
  try {
    const poId = req.params.id;
    const po = await sql\`SELECT * FROM purchase_orders WHERE id = \${poId} AND user_id = \${req.user.tenantId}\`;
    
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
        await sql\`
          UPDATE products 
          SET stock_quantity = stock_quantity + \${item.quantity}
          WHERE id = \${item.product_id} AND user_id = \${req.user.tenantId}
        \`;
      }
    }

    const updated = await sql\`
      UPDATE purchase_orders SET status = 'received' 
      WHERE id = \${poId} AND user_id = \${req.user.tenantId}
      RETURNING *
    \`;

    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Returns Routes ---
app.get('/api/returns', authenticateToken, async (req: any, res) => {
  try {
    const returns = await sql\`
      SELECT r.*, b.uuid as original_bill_uuid
      FROM returns r
      LEFT JOIN bills b ON r.bill_id = b.id
      WHERE r.user_id = \${req.user.tenantId}
      ORDER BY r.return_date DESC
    \`;
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
    const newReturn = await sql\`
      INSERT INTO returns (user_id, bill_id, items, refund_amount, reason)
      VALUES (\${req.user.tenantId}, \${bill_id}, \${JSON.stringify(items)}, \${refund_amount}, \${reason})
      RETURNING *
    \`;

    if (restock) {
      for (const item of items) {
        if (item.product_id) {
          await sql\`
            UPDATE products 
            SET stock_quantity = stock_quantity + \${item.quantity}
            WHERE id = \${item.product_id} AND user_id = \${req.user.tenantId}
          \`;
        }
      }
    }

    res.json(newReturn[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
`;

code = code.replace(/\/\/ --- Quotes Routes ---/, newRoutes + '\n// --- Quotes Routes ---');
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with POs and Returns");
