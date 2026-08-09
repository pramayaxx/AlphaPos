const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "const Checkout = ({ products, settings, customers, currentUser, onBack, onAddCustomer }: { products: Product[], settings: ShopSettings, customers: Customer[], currentUser: User, onBack: () => void, onAddCustomer?: () => void }) => {",
  "const Checkout = ({ products, settings, customers, currentUser, onBack, onAddCustomer, onSaleComplete }: { products: Product[], settings: ShopSettings, customers: Customer[], currentUser: User, onBack: () => void, onAddCustomer?: () => void, onSaleComplete?: () => void }) => {"
);

fs.writeFileSync('src/App.tsx', code);
