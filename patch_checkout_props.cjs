const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "const Checkout = ({ products, settings, customers, currentUser, onBack }: { products: Product[], settings: ShopSettings, customers: Customer[], currentUser: User, onBack: () => void }) => {",
  "const Checkout = ({ products, settings, customers, currentUser, onBack, onAddCustomer }: { products: Product[], settings: ShopSettings, customers: Customer[], currentUser: User, onBack: () => void, onAddCustomer?: () => void }) => {"
);

code = code.replace(
  "<Checkout products={products} settings={settings} customers={customers} currentUser={currentUser} onBack={() => setActiveTab('dashboard')} />",
  "<Checkout products={products} settings={settings} customers={customers} currentUser={currentUser} onBack={() => setActiveTab('dashboard')} onAddCustomer={fetchData} />"
);

fs.writeFileSync('src/App.tsx', code);
