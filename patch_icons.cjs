const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/import {([\s\S]*?)LayoutDashboard,/, "import {$1Truck, LayoutDashboard,");
fs.writeFileSync('src/App.tsx', code);
