const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const Checkout = \(\{ products, settings, customers, currentUser, onBack, onAddCustomer \} : \{ products: Product\[\], settings: ShopSettings, customers: Customer\[\], currentUser: User, onBack: \(\) => void, onAddCustomer\?: \(\) => void \}\) => \{/,
  "const Checkout = ({ products, settings, customers, currentUser, onBack, onAddCustomer, onSaleComplete }: { products: Product[], settings: ShopSettings, customers: Customer[], currentUser: User, onBack: () => void, onAddCustomer?: () => void, onSaleComplete?: () => void }) => {"
);

code = code.replace(
  /const savedBill = await api\.post\('\/bills', savedBillData\);\s*setLastBill\(\{\.\.\.savedBill, dateTime: new Date\(savedBill\.dateTime\)\}\);\s*setCart\(\[\]\);\s*setShowReceipt\(true\);/,
  "const savedBill = await api.post('/bills', savedBillData);\n      setLastBill({...savedBill, dateTime: new Date(savedBill.dateTime)});\n      setCart([]);\n      setShowReceipt(true);\n      if (onSaleComplete) onSaleComplete();"
);

code = code.replace(
  /onBack=\{\(\) => setActiveTab\('dashboard'\)\}/g,
  "onBack={() => setActiveTab('dashboard')} onSaleComplete={fetchData}"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched checkout refresh");
