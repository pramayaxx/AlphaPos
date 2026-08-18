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

  // test product creation
  await post('/api/products', {
    item_number: `T-${Date.now()}`,
    name: `Test Product ${Date.now()}`,
    category: 'Test',
    price: 10,
    stock_quantity: 100,
    low_stock_threshold: 10,
    image_url: '',
    discount_value: 0,
    discount_type: 'amount'
  });

  process.exit(0);
}
test();
