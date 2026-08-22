const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/pointsEarned: Math\.floor\(grandTotal\), \/\/ 1 point per \$1 spent/g, "");
fs.writeFileSync('src/App.tsx', code);
