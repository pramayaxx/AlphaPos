const fs = require('fs');
let code = fs.readFileSync('src/lib/utils.ts', 'utf-8');

code = code.replace(
  /const safeAmount = isNaN\(amount\) \|\| amount === undefined \? 0 : amount;/,
  "const parsed = Number(amount);\n  const safeAmount = isNaN(parsed) ? 0 : parsed;"
);

fs.writeFileSync('src/lib/utils.ts', code);
console.log("Fixed formatCurrency");
