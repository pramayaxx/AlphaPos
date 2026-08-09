import { neon } from '@neondatabase/serverless';
try {
  const sql = neon('postgresql://user:pass@host/db');
  console.log("Success");
} catch(e) {
  console.error("Error:", e.message);
}
