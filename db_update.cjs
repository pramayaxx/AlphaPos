const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function run() {
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  
  try {
    await sql`ALTER TABLE users ADD COLUMN owner_id INTEGER REFERENCES users(id)`;
    console.log("Added owner_id to users");
  } catch (e) {
    console.log("Error or already exists:", e.message);
  }
}
run();
