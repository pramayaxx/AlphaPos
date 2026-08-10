const fs = require('fs');

// Fix server.ts
let server = fs.readFileSync('server.ts', 'utf-8');
server = server.replace(/const billRes = await db\.query\('SELECT \* FROM bills WHERE uuid = \$1 AND tenant_id = \$2', \[uuid, req\.user\.tenant_id\]\);/g, "const billRes = await sql`SELECT * FROM bills WHERE uuid = ${uuid} AND user_id = ${req.user.tenantId}`;");
server = server.replace(/billRes\.rows\.length/g, "billRes.length");
server = server.replace(/billRes\.rows\[0\]/g, "billRes[0]");
server = server.replace(/bill\.grand_total/g, "bill.grand_total || bill.grandTotal");
fs.writeFileSync('server.ts', server);

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(/await api\.post\(\`\/bills\/\$\{lastBill\.uuid\}\/send-receipt\`, \{ email \}\);/, "await (window as any).api.post(`/bills/${lastBill.uuid}/send-receipt`, { email });");
appCode = appCode.replace(/await api\.post\(\`\/bills\/\$\{lastBill\.uuid\}\/create-payment-link\`\);/, "await (window as any).api.post(`/bills/${lastBill.uuid}/create-payment-link`, {});");
fs.writeFileSync('src/App.tsx', appCode);

console.log("Fixed lint errors.");
