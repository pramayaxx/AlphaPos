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

  // test bill creation
  await post('/api/bills', {
    uuid: 'test-uuid-123',
    dateTime: new Date().toISOString(),
    items: [],
    subtotal: 100,
    discount: 0,
    discountType: 'amount',
    discountValue: 0,
    grandTotal: 100,
    isPrinted: false,
    customerId: null,
    paymentMethod: 'cash',
    taxAmount: 0,
    taxRate: 0,
    status: 'paid'
  });

  process.exit(0);
}
test();
