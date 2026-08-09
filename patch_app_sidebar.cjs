const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace standard SidebarItems with conditional ones
const replacements = [
  { match: /<SidebarItem icon=\{ChefHat\} label="KDS"/, replace: "{currentUser?.package_type !== 'BASIC' && <SidebarItem icon={ChefHat} label=\"KDS\"" },
  { match: /<SidebarItem icon=\{FileText\} label="Invoices"/, replace: "{currentUser?.package_type !== 'BASIC' && <SidebarItem icon={FileText} label=\"Invoices\"" },
  { match: /<SidebarItem icon=\{Calculator\} label="Payroll"/, replace: "{currentUser?.package_type !== 'BASIC' && currentStaff?.role !== 'CASHIER' && <SidebarItem icon={Calculator} label=\"Payroll\"" },
  { match: /<SidebarItem icon=\{BarChart3\} label="Reports"/, replace: "{currentStaff?.role !== 'CASHIER' && <SidebarItem icon={BarChart3} label=\"Reports\"" },
  { match: /<SidebarItem icon=\{Settings\} label="Settings"/, replace: "{currentStaff?.role !== 'CASHIER' && <SidebarItem icon={Settings} label=\"Setup\"" },
];

let replaced = false;
for (const r of replacements) {
  if (code.includes(r.match.source.replace(/\\/g, '').replace(/\^/g, '').replace(/\$/g, ''))) {
      code = code.replace(r.match, r.replace);
      replaced = true;
  }
}

// Ensure closing braces for conditional renders
code = code.replace(/label="KDS" active=\{activeTab === 'kds'\} onClick=\{\(\) => setActiveTab\('kds'\)\} \/>/, "label=\"KDS\" active={activeTab === 'kds'} onClick={() => setActiveTab('kds')} />}");
code = code.replace(/label="Invoices" active=\{activeTab === 'invoices'\} onClick=\{\(\) => setActiveTab\('invoices'\)\} \/>/, "label=\"Invoices\" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />}");
code = code.replace(/label="Payroll" active=\{activeTab === 'payroll'\} onClick=\{\(\) => setActiveTab\('payroll'\)\} \/>/, "label=\"Payroll\" active={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')} />}");
code = code.replace(/label="Reports" active=\{activeTab === 'reports'\} onClick=\{\(\) => setActiveTab\('reports'\)\} \/>/, "label=\"Reports\" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />}");
code = code.replace(/label="Setup" active=\{activeTab === 'settings'\} onClick=\{\(\) => setActiveTab\('settings'\)\} \/>/, "label=\"Setup\" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />}");


// Also hide the mobile icons for reports and settings
code = code.replace(/<SidebarItem icon=\{BarChart3\} label="Reports" active=\{activeTab === 'reports'\} onClick=\{\(\) => setActiveTab\('reports'\)\} isMobile \/>/, "{currentStaff?.role !== 'CASHIER' && <SidebarItem icon={BarChart3} label=\"Reports\" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} isMobile />}");
code = code.replace(/<SidebarItem icon=\{Settings\} label="Setup" active=\{activeTab === 'settings'\} onClick=\{\(\) => setActiveTab\('settings'\)\} isMobile \/>/, "{currentStaff?.role !== 'CASHIER' && <SidebarItem icon={Settings} label=\"Setup\" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isMobile />}");


fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx sidebar for permissions");
