import postgres from 'postgres';
import 'dotenv/config';
async function test() {
  const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  try {
    const res = await sql`SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'products' AND constraint_type = 'UNIQUE'`;
    console.log(res);
  } catch (err) {
    console.log(err);
  }
  process.exit(0);
}
test();
