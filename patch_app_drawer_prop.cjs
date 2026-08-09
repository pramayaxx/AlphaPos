const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<CashDrawerScreen bills=\{bills\} expenses=\{expenses\} \/>/, "<CashDrawerScreen bills={bills} />");
code = code.replace(/ExpensesScreen/g, "ExpensesScreenFallback");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx Drawer props and ExpensesScreen");
