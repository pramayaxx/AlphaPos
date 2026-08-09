const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const pdfRoute = `
const PDFDocument = require('pdfkit');

app.get('/api/public/bills/:uuid/pdf', async (req, res) => {
  try {
    const bills = await sql\`SELECT * FROM bills WHERE uuid = \${req.params.uuid}\`;
    if (bills.length === 0) return res.status(404).send('Bill not found');
    const bill = bills[0];
    const items = await sql\`SELECT * FROM bill_items WHERE bill_id = \${bill.id}\`;
    const settings = await sql\`SELECT * FROM shop_settings WHERE user_id = \${bill.user_id}\`;
    const shop = settings.length > 0 ? settings[0] : null;

    const doc = new PDFDocument({ margin: 30, size: [250, 600] });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', \`inline; filename="bill-\${bill.uuid}.pdf"\`);
    doc.pipe(res);

    // Shop Name
    if (shop?.shop_name) {
      doc.fontSize(16).text(shop.shop_name, { align: 'center' });
    } else {
      doc.fontSize(16).text('Receipt', { align: 'center' });
    }
    
    if (shop?.address) doc.fontSize(10).text(shop.address, { align: 'center' });
    if (shop?.phone) doc.fontSize(10).text('Tel: ' + shop.phone, { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(10).text(\`Bill No: \${bill.uuid}\`);
    doc.text(\`Date: \${new Date(bill.date_time).toLocaleString()}\`);
    doc.moveDown();

    doc.text('-----------------------------------------');
    items.forEach(item => {
      doc.text(\`\${item.name}\`);
      doc.text(\`\${item.quantity} x Rs \${item.price} = Rs \${item.total}\`, { align: 'right' });
    });
    doc.text('-----------------------------------------');
    doc.moveDown();

    doc.text(\`Subtotal: Rs \${bill.subtotal}\`, { align: 'right' });
    if (bill.discount_value > 0) {
      const distText = bill.discount_type === 'percentage' ? \`\${bill.discount_value}%\` : \`Rs \${bill.discount_value}\`;
      doc.text(\`Discount: \${distText}\`, { align: 'right' });
    }
    if (bill.tax_amount > 0) {
      doc.text(\`Tax: Rs \${bill.tax_amount}\`, { align: 'right' });
    }
    doc.fontSize(12).text(\`Total: Rs \${bill.grand_total}\`, { align: 'right' });
    
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
`;

code = code.replace('// Init DB', pdfRoute);
fs.writeFileSync('server.ts', code);
