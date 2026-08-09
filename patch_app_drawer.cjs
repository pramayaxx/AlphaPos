const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/import SuppliersScreen from '.\/SuppliersScreen';/, "import SuppliersScreen from './SuppliersScreen';\nimport CashDrawerScreen from './CashDrawerScreen';");

code = code.replace(
  /const \[activeTab, setActiveTab\] = useState\<'dashboard' \| 'checkout' \| 'transactions' \| 'products' \| 'customers' \| 'reports' \| 'settings' \| 'printer-setup' \| 'pending-prints' \| 'staff' \| 'expenses' \| 'suppliers'\>\('dashboard'\);/,
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'checkout' | 'transactions' | 'products' | 'customers' | 'reports' | 'settings' | 'printer-setup' | 'pending-prints' | 'staff' | 'expenses' | 'suppliers' | 'drawer'>('dashboard');"
);

code = code.replace(
  /<SidebarItem icon=\{Users\} label="Customers" active=\{activeTab === 'customers'\} onClick=\{\(\) => setActiveTab\('customers'\)\} \/>/,
  `<SidebarItem icon={Users} label="Customers" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
              <SidebarItem icon={Wallet} label="Cash Drawer" active={activeTab === 'drawer'} onClick={() => setActiveTab('drawer')} />`
);

code = code.replace(
  /\{activeTab === 'customers' && <CustomersScreen customers=\{customers\} onAddCustomer=\{fetchData\} bills=\{bills\} settings=\{settings\} \/>\}/,
  `{activeTab === 'customers' && <CustomersScreen customers={customers} onAddCustomer={fetchData} bills={bills} settings={settings} />}
            {activeTab === 'drawer' && <CashDrawerScreen bills={bills} expenses={expenses} />}`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with CashDrawerScreen");
