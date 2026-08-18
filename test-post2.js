import postgres from 'postgres';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function test() {
  const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  const token = jwt.sign({ id: 1, tenantId: 1, email: 'test@test.com', role: 'admin' }, process.env.JWT_SECRET || 'secret');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  async function post(url, body) {
    try {
      const res = await fetch(`http://127.0.0.1:3000${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const data = await res.text();
      console.log(`POST ${url}: ${res.status} ${data}`);
    } catch(err) {
      console.log(`FETCH ERROR ${url}: ${err.message}`);
    }
  }

  // test invoice creation
  await post('/api/invoices', {
    customer_id: '1',
    amount: 100,
    due_date: '2026-12-31',
  });

  // test bill creation
  await post('/api/bills', {
    date_time: new Date().toISOString(),
    subtotal: 100,
    discount: 0,
    discount_type: 'amount',
    discount_value: 0,
    grand_total: 100,
    is_printed: false,
    customer_id: '1',
    payment_method: 'cash',
    tax_amount: 0,
    tax_rate: 0,
    status: 'completed',
    items: []
  });

  process.exit(0);
}
test();
