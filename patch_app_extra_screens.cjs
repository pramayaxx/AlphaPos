const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/import ExpensesScreen from '.\/ExpensesScreen';/, "import ExpensesScreen from './ExpensesScreen';\nimport AttendanceScreen from './AttendanceScreen';\nimport StockAdjustmentsScreen from './StockAdjustmentsScreen';");

code = code.replace(
  /const \[activeTab, setActiveTab\] = useState\<'dashboard' \| 'checkout' \| 'transactions' \| 'products' \| 'customers' \| 'reports' \| 'settings' \| 'printer-setup' \| 'pending-prints' \| 'staff' \| 'expenses' \| 'suppliers' \| 'drawer' \| 'coupons'\>\('dashboard'\);/,
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'checkout' | 'transactions' | 'products' | 'customers' | 'reports' | 'settings' | 'printer-setup' | 'pending-prints' | 'staff' | 'expenses' | 'suppliers' | 'drawer' | 'coupons' | 'attendance' | 'adjustments'>('dashboard');"
);

// Sidebar desktop
code = code.replace(
  /<SidebarItem icon=\{UserPlus\} label="Staff" active=\{activeTab === 'staff'\} onClick=\{\(\) => setActiveTab\('staff'\)\} \/>/,
  `<SidebarItem icon={UserPlus} label="Staff" active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />
              <SidebarItem icon={Clock} label="Time Clock" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />`
);

// Sidebar desktop 2 (products section)
code = code.replace(
  /<SidebarItem icon=\{Package\} label="Products" active=\{activeTab === 'products'\} onClick=\{\(\) => setActiveTab\('products'\)\} \/>/,
  `<SidebarItem icon={Package} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
              <SidebarItem icon={PackageMinus} label="Stock Audits" active={activeTab === 'adjustments'} onClick={() => setActiveTab('adjustments')} />`
);


code = code.replace(
  /\{activeTab === 'expenses' && <ExpensesScreen \/>\}/,
  `{activeTab === 'expenses' && <ExpensesScreen />}
            {activeTab === 'attendance' && <AttendanceScreen />}
            {activeTab === 'adjustments' && <StockAdjustmentsScreen products={products} />}`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with Attendance and Adjustments screens");
