const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/import {([\s\S]*?)Gift,/, "import {$1RotateCcw, PackageOpen, Gift,");
fs.writeFileSync('src/App.tsx', code);
