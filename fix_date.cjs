const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const savedBill = await api\.post\('\/bills', savedBillData\);\s*setLastBill\(savedBill\);/,
  "const savedBill = await api.post('/bills', savedBillData);\n      setLastBill({...savedBill, dateTime: new Date(savedBill.dateTime)});"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed date issue in handleConfirm");
