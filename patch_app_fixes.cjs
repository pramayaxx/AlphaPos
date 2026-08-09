const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// fix Banknote
code = code.replace(/import {([\s\S]*?)Ticket,/, "import {$1Banknote, Ticket,");

// fix image type
code = code.replace(/image: \{ type: 'jpeg', quality: 0.98 \},/, "image: { type: 'jpeg' as const, quality: 0.98 },");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
