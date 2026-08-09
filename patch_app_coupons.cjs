const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/import CashDrawerScreen from '.\/CashDrawerScreen';/, "import CashDrawerScreen from './CashDrawerScreen';\nimport CouponsScreen from './CouponsScreen';");

code = code.replace(
  /const \[activeTab, setActiveTab\] = useState\<'dashboard' \| 'checkout' \| 'transactions' \| 'products' \| 'customers' \| 'reports' \| 'settings' \| 'printer-setup' \| 'pending-prints' \| 'staff' \| 'expenses' \| 'suppliers' \| 'drawer'\>\('dashboard'\);/,
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'checkout' | 'transactions' | 'products' | 'customers' | 'reports' | 'settings' | 'printer-setup' | 'pending-prints' | 'staff' | 'expenses' | 'suppliers' | 'drawer' | 'coupons'>('dashboard');"
);

code = code.replace(
  /<SidebarItem icon=\{Wallet\} label="Cash Drawer" active=\{activeTab === 'drawer'\} onClick=\{\(\) => setActiveTab\('drawer'\)\} \/>/,
  `<SidebarItem icon={Wallet} label="Cash Drawer" active={activeTab === 'drawer'} onClick={() => setActiveTab('drawer')} />
              <SidebarItem icon={Ticket} label="Coupons" active={activeTab === 'coupons'} onClick={() => setActiveTab('coupons')} />`
);

code = code.replace(
  /\{activeTab === 'drawer' && <CashDrawerScreen bills=\{bills\} expenses=\{expenses\} \/>\}/,
  `{activeTab === 'drawer' && <CashDrawerScreen bills={bills} expenses={expenses} />}
            {activeTab === 'coupons' && <CouponsScreen />}`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with CouponsScreen");
