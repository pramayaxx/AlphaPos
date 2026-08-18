import postgres from 'postgres';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

async function test() {
  const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  
  // create dummy user
  const user = await sql`INSERT INTO users (email, password, full_name, role) VALUES ('test3@test.com', 'test', 'Test', 'owner') RETURNING id`;
  const userId = user[0].id;
  await sql`UPDATE users SET owner_id = ${userId} WHERE id = ${userId}`;
  
  const token = jwt.sign({ id: userId, username: 'Test', role: 'owner', tenantId: userId }, process.env.JWT_SECRET || 'secret');
  
  const res = await fetch('http://127.0.0.1:3000/api/purchase-orders/1/receive', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log("Status:", res.status);
  console.log("Response:", await res.text());
  process.exit(0);
}
test();
