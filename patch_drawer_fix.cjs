const fs = require('fs');
let code = fs.readFileSync('src/CashDrawerScreen.tsx', 'utf-8');

code = code.replace(/const CashDrawerScreen = \(\{ bills, expenses \}: \{ bills: Bill\[\], expenses: Expense\[\] \}\) => \{/, 
  "const CashDrawerScreen = ({ bills }: { bills: Bill[] }) => {");

fs.writeFileSync('src/CashDrawerScreen.tsx', code);
console.log("Patched CashDrawerScreen");
