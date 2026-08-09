const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/import {([\s\S]*?)Truck,/, "import {$1Wallet, Truck,");
fs.writeFileSync('src/App.tsx', code);
