const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const billUrl = \`\$\{window\.location\.origin\}\/api\/public\/bills\/\$\{lastBill\.uuid\}\/pdf\`;/;
code = code.replace(regex, 'const billUrl = \`\$\{window.location.origin\}/public/bill/\$\{lastBill.uuid\}\`;');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched billUrl in WhatsApp share");
