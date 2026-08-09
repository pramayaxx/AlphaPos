import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://user:pass@host/db');
sql`SELECT 1`.then(console.log).catch(e => console.error("Error:", e.message));
