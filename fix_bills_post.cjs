const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/is_printed, customer_id, payment_method, tax_amount, tax_rate, status\)/g, 
  "is_printed, customer_id, payment_method, tax_amount, tax_rate, status, points_used, points_earned)");

code = code.replace(/\$\{b.isPrinted\}, \$\{b.customerId \|\| null\}, \$\{b.paymentMethod \|\| 'cash'\}, \$\{b.taxAmount \|\| 0\}, \$\{b.taxRate \|\| 0\}, \$\{b.status \|\| 'paid'\}\)/g, 
  "${b.isPrinted}, ${b.customerId || null}, ${b.paymentMethod || 'cash'}, ${b.taxAmount || 0}, ${b.taxRate || 0}, ${b.status || 'paid'}, ${b.pointsRedeemed || 0}, ${b.pointsEarned || 0})");

code = code.replace(/savedBill\.status = savedBill\.status;/g, 
  "savedBill.status = savedBill.status;\n    savedBill.pointsEarned = savedBill.points_earned;\n    savedBill.pointsRedeemed = savedBill.points_used;");

fs.writeFileSync('server.ts', code);
