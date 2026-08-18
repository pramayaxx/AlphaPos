import postgres from 'postgres';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

async function test() {
  // Create a fake token for tenantId 1
  const token = jwt.sign({ id: 1, tenantId: 1, email: 'test@test.com', role: 'admin' }, process.env.JWT_SECRET || 'secret');
  
  const endpoints = [
    '/api/staff',
    '/api/auth/me',
    '/api/products',
    '/api/shifts/current',
    '/api/shifts',
    '/api/settings',
    '/api/branches',
    '/api/promotions',
    '/api/me',
    '/api/shop-settings'
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
