const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace activeTab state type definition
code = code.replace(/const \[activeTab, setActiveTab\] = useState\<'dashboard' \| 'checkout' \| 'transactions' \| 'products' \| 'customers' \| 'reports' \| 'settings' \| 'printer-setup' \| 'pending-prints' \| 'staff'\>\('dashboard'\);/, 
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'checkout' | 'transactions' | 'products' | 'customers' | 'reports' | 'settings' | 'printer-setup' | 'pending-prints' | 'staff' | 'expenses'>('dashboard');");

// Add Sidebar link
code = code.replace(/<SidebarItem icon=\{BarChart3\} label="Reports" active=\{activeTab === 'reports'\} onClick=\{\(\) => setActiveTab\('reports'\)\} \/>/, 
  `<SidebarItem icon={BarChart3} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
              <SidebarItem icon={Banknote} label="Expenses" active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />`);

// Add Mobile Sidebar link
code = code.replace(/<SidebarItem icon=\{BarChart3\} label="Reports" active=\{activeTab === 'reports'\} onClick=\{\(\) => setActiveTab\('reports'\)\} isMobile \/>/, 
  `<SidebarItem icon={BarChart3} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} isMobile />
            <SidebarItem icon={Banknote} label="Expenses" active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} isMobile />`);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Sidebar");
