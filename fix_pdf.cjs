const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  "doc.text(`\\${item.quantity} x Rs \\${item.price} = Rs \\${(item.quantity * item.price).toFixed(2)}`, { align: 'right' });",
  "doc.text(`${item.quantity} x Rs ${item.price} = Rs ${(item.quantity * item.price).toFixed(2)}`, { align: 'right' });"
);

fs.writeFileSync('server.ts', code);
console.log("Fixed PDF total correctly");
