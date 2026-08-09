const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add Import
code = code.replace(/import StaffScreen from '.\/StaffScreen';/, "import StaffScreen from './StaffScreen';\nimport SuppliersScreen from './SuppliersScreen';");

// Update Type for tabs
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState\<'dashboard' \| 'checkout' \| 'transactions' \| 'products' \| 'customers' \| 'reports' \| 'settings' \| 'printer-setup' \| 'pending-prints' \| 'staff' \| 'expenses'\>\('dashboard'\);/,
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'checkout' | 'transactions' | 'products' | 'customers' | 'reports' | 'settings' | 'printer-setup' | 'pending-prints' | 'staff' | 'expenses' | 'suppliers'>('dashboard');"
);

// Add Sidebar tab
code = code.replace(
  /<SidebarItem icon=\{Users\} label="Customers" active=\{activeTab === 'customers'\} onClick=\{\(\) => setActiveTab\('customers'\)\} \/>/,
  `<SidebarItem icon={Users} label="Customers" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
              <SidebarItem icon={Truck} label="Suppliers" active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />`
);

// Add to Screens rendering
code = code.replace(
  /\{activeTab === 'customers' && <CustomersScreen customers=\{customers\} onAddCustomer=\{fetchData\} bills=\{bills\} settings=\{settings\} \/>\}/,
  `{activeTab === 'customers' && <CustomersScreen customers={customers} onAddCustomer={fetchData} bills={bills} settings={settings} />}
            {activeTab === 'suppliers' && <SuppliersScreen products={products} />}`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with SuppliersScreen");
