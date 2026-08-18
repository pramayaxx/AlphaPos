import postgres from 'postgres';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function test() {
  const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  
  // Create a fake token for tenantId 1
  const token = jwt.sign({ id: 1, tenantId: 1, email: 'test@test.com', role: 'admin' }, process.env.JWT_SECRET || 'secret');
  
  const endpoints = [
    '/api/customers',
    '/api/bills',
    '/api/attendance',
    '/api/gift-cards',
    '/api/purchase-orders', // 1075 order_date
    '/api/returns', // 1151 return_date
    '/api/quotes',
    '/api/stock-adjustments', // 1247 created_at
    '/api/coupons',
    '/api/cash-shifts',
    '/api/suppliers',
    '/api/purchases',
    '/api/expenses',
    '/api/invoices',
    '/api/payroll',
    '/api/superadmin/users'
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`http://127.0.0.1:3000${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.text();
      if (!res.ok) {
        console.log(`ERROR on ${endpoint}: ${res.status} ${data}`);
      } else {
        console.log(`OK ${endpoint}`);
      }
    } catch(err) {
      console.log(`FETCH ERROR on ${endpoint}: ${err.message}`);
    }
  }
  process.exit(0);
}
test();
