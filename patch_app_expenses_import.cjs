const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/import CouponsScreen from '.\/CouponsScreen';/, "import CouponsScreen from './CouponsScreen';\nimport ExpensesScreen from './ExpensesScreen';");
code = code.replace(/ExpensesScreenFallback/g, "ExpensesScreen");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with ExpensesScreen import");
