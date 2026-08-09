const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("import BarcodeScreen")) {
  code = code.replace(/import PurchaseOrdersScreen from '\.\/PurchaseOrdersScreen';/, "import PurchaseOrdersScreen from './PurchaseOrdersScreen';\nimport BarcodeScreen from './BarcodeScreen';");
}

if (!code.includes("activeTab === 'barcode'")) {
  // Update the activeTab state to include 'barcode'
  code = code.replace(/const \[activeTab, setActiveTab\] = useState<'dashboard' \| 'checkout' \| 'transactions' \| 'products' \| 'customers' \| 'reports' \| 'settings' \| 'printer-setup' \| 'pending-prints' \| 'staff' \| 'expenses' \| 'suppliers' \| 'drawer' \| 'coupons' \| 'attendance' \| 'adjustments' \| 'giftcards' \| 'quotes' \| 'returns' \| 'po'>\('dashboard'\);/, 
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'checkout' | 'transactions' | 'products' | 'customers' | 'reports' | 'settings' | 'printer-setup' | 'pending-prints' | 'staff' | 'expenses' | 'suppliers' | 'drawer' | 'coupons' | 'attendance' | 'adjustments' | 'giftcards' | 'quotes' | 'returns' | 'po' | 'barcode'>('dashboard');");
}

if (!code.includes("<SidebarItem icon={BarcodeIcon}")) {
  code = code.replace(/<SidebarItem icon=\{PackageMinus\} label="Stock Audits" active=\{activeTab === 'adjustments'\} onClick=\{\(\) => setActiveTab\('adjustments'\)\} \/>/, 
  `<SidebarItem icon={PackageMinus} label="Stock Audits" active={activeTab === 'adjustments'} onClick={() => setActiveTab('adjustments')} />
              <SidebarItem icon={ScanBarcode} label="Barcodes" active={activeTab === 'barcode'} onClick={() => setActiveTab('barcode')} />`);
}

if (!code.includes("activeTab === 'barcode' && <BarcodeScreen")) {
  code = code.replace(/\{activeTab === 'adjustments' && <StockAdjustmentsScreen products=\{products\} \/>\}/, 
  `{activeTab === 'adjustments' && <StockAdjustmentsScreen products={products} />}
            {activeTab === 'barcode' && <BarcodeScreen products={products} />}`);
}

if (!code.includes("ScanBarcode")) {
  code = code.replace(/import \{ \n  Banknote,/, "import { ScanBarcode, \n  Banknote,");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with BarcodeScreen");
