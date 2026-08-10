const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf-8');

const stripeCode = `
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123'); // Dummy key if not set
`;

if (!server.includes("import Stripe")) {
    server = server.replace("import express from 'express';", "import express from 'express';\n" + stripeCode);
}

const receiptEndpoints = `
app.post('/api/bills/:uuid/send-receipt', authenticateToken, async (req: any, res) => {
  const { uuid } = req.params;
  const { email, phone } = req.body;
  try {
    const billRes = await db.query('SELECT * FROM bills WHERE uuid = $1 AND tenant_id = $2', [uuid, req.user.tenant_id]);
    if (billRes.rows.length === 0) return res.status(404).json({ error: 'Bill not found' });
    const bill = billRes.rows[0];

    // Mock Email/SMS Send
    console.log(\`[NOTIFICATION] Sending receipt for Bill \${uuid} to \${email || phone}\`);
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
    const billRes = await db.query('SELECT * FROM bills WHERE uuid = $1 AND tenant_id = $2', [uuid, req.user.tenant_id]);
    if (billRes.rows.length === 0) return res.status(404).json({ error: 'Bill not found' });
    const bill = billRes.rows[0];

    // Create a stripe payment link
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: \`Order #\${uuid.substring(0,8)}\`,
          },
          unit_amount: Math.round(bill.grand_total * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: \`http://localhost:3000/api/public/bills/\${uuid}/success\`,
      cancel_url: \`http://localhost:3000/api/public/bills/\${uuid}/cancel\`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
`;

if (!server.includes("/api/bills/:uuid/send-receipt")) {
    server = server.replace("app.get('*', (req, res) => {", receiptEndpoints + "\n    app.get('*', (req, res) => {");
}

fs.writeFileSync('server.ts', server);
console.log("Updated server.ts with Stripe and Receipt endpoints.");
