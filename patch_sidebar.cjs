const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "<SidebarItem icon={Users} label=\"Customers\" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />",
  "<SidebarItem icon={Users} label=\"Customers\" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />\n              <SidebarItem icon={UserCircle2} label=\"Staff\" active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />"
);

code = code.replace(
  "LayoutDashboard,\n  ShoppingCart,",
  "LayoutDashboard,\n  ShoppingCart,\n  UserCircle2,"
);

code = code.replace(
  "| 'settings' | 'printer-setup' | 'pending-prints'>('dashboard');",
  "| 'settings' | 'printer-setup' | 'pending-prints' | 'staff'>('dashboard');"
);

fs.writeFileSync('src/App.tsx', code);
