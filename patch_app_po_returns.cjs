const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/import QuotesScreen from '.\/QuotesScreen';/, 
  "import QuotesScreen from './QuotesScreen';\nimport ReturnsScreen from './ReturnsScreen';\nimport PurchaseOrdersScreen from './PurchaseOrdersScreen';");

code = code.replace(
  /const \[activeTab, setActiveTab\] = useState\<'dashboard' \| 'checkout' \| 'transactions' \| 'products' \| 'customers' \| 'reports' \| 'settings' \| 'printer-setup' \| 'pending-prints' \| 'staff' \| 'expenses' \| 'suppliers' \| 'drawer' \| 'coupons' \| 'attendance' \| 'adjustments' \| 'giftcards' \| 'quotes'\>\('dashboard'\);/,
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'checkout' | 'transactions' | 'products' | 'customers' | 'reports' | 'settings' | 'printer-setup' | 'pending-prints' | 'staff' | 'expenses' | 'suppliers' | 'drawer' | 'coupons' | 'attendance' | 'adjustments' | 'giftcards' | 'quotes' | 'returns' | 'po'>('dashboard');"
);

// Add returns to transactions grouping
code = code.replace(
  /<SidebarItem icon=\{FileText\} label="Quotes" active=\{activeTab === 'quotes'\} onClick=\{\(\) => setActiveTab\('quotes'\)\} \/>/,
  `<SidebarItem icon={FileText} label="Quotes" active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} />
              <SidebarItem icon={RotateCcw} label="Returns" active={activeTab === 'returns'} onClick={() => setActiveTab('returns')} />`
);

// Add POs to suppliers grouping
code = code.replace(
  /<SidebarItem icon=\{Truck\} label="Suppliers" active=\{activeTab === 'suppliers'\} onClick=\{\(\) => setActiveTab\('suppliers'\)\} \/>/,
  `<SidebarItem icon={Truck} label="Suppliers" active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
              <SidebarItem icon={PackageOpen} label="Purchase Orders" active={activeTab === 'po'} onClick={() => setActiveTab('po')} />`
);

code = code.replace(
  /\{activeTab === 'quotes' && <QuotesScreen customers=\{customers\} \/>\}/,
  `{activeTab === 'quotes' && <QuotesScreen customers={customers} />}
            {activeTab === 'returns' && <ReturnsScreen />}
            {activeTab === 'po' && <PurchaseOrdersScreen suppliers={suppliers} products={products} />}`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with POs and Returns screens");
