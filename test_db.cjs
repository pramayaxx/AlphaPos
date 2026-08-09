const postgres = require('postgres');
const url = process.env.VITE_XATA_DATABASE_URL;
console.log(url);
const sql = postgres(url, { ssl: 'require', connect_timeout: 5 });
async function run() {
  try {
    const res = await sql`SELECT 1 as num`;
    console.log(res);
  } catch (e) {
    console.error(e);
  } finally {
    sql.end();
  }
}
run();
