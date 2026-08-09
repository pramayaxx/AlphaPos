const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/color: 'blue' \| 'emerald' \| 'amber'/g, "color: 'blue' | 'emerald' | 'amber' | 'rose'");
code = code.replace(/<span className="hidden lg:inline">Add Expense<\/span>/, '<span className="hidden sm:inline">Add Expense</span>');

fs.writeFileSync('src/App.tsx', code);
