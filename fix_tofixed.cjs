const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/item\.price\.toFixed/g, "Number(item.price).toFixed");
code = code.replace(/bill\.subtotal\.toFixed/g, "Number(bill.subtotal).toFixed");
code = code.replace(/bill\.discount\.toFixed/g, "Number(bill.discount).toFixed");
// Let's also check if there are other occurrences
fs.writeFileSync('src/App.tsx', code);
console.log("Fixed toFixed conversions");
