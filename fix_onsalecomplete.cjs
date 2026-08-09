const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/if \(onSaleComplete\) onSaleComplete\(\);/g, "if (typeof onSaleComplete !== 'undefined' && onSaleComplete) onSaleComplete();");

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed onSaleComplete to be robust against caching issues");
