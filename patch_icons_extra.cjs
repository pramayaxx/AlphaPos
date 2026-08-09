const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/import {([\s\S]*?)UserPlus,/, "import {$1Clock, PackageMinus, UserPlus,");
fs.writeFileSync('src/App.tsx', code);
