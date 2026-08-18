import postgres from 'postgres';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function test() {
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

  await post('/api/quotes', {
    uuid: 'QT-123456',
    customerId: null,
    items: [],
    subtotal: 100,
    discount: 0,
    discountType: 'amount',
    discountValue: 0,
    taxAmount: 0,
    taxRate: 0,
    grandTotal: 100
  });

  process.exit(0);
}
test();
