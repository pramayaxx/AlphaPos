const fs = require('fs');
let code = fs.readFileSync('src/i18n.tsx', 'utf-8');
code = code.replace(/    kds: '.*',\n/g, '');
fs.writeFileSync('src/i18n.tsx', code);
