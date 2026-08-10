const routes = [
  '/api/auth/me',
  '/api/settings',
  '/api/products',
  '/api/bills',
  '/api/customers',
  '/api/staff',
  '/api/expenses'
];

async function run() {
  for (const r of routes) {
    const res = await fetch('http://localhost:3000' + r);
    const text = await res.text();
    console.log(r, res.status, text.substring(0, 15));
  }
}
run();
