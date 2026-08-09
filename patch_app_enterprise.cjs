const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Imports
const newImports = `
import PayrollScreen from './PayrollScreen';
import PromotionsScreen from './PromotionsScreen';
import BranchesScreen from './BranchesScreen';
`;

if (!code.includes("import PayrollScreen")) {
  code = code.replace(/import BarcodeScreen from '\.\/BarcodeScreen';/, "import BarcodeScreen from './BarcodeScreen';\n" + newImports);
}

// activeTab type
if (!code.includes("activeTab === 'payroll'")) {
  code = code.replace(
    /const \[activeTab, setActiveTab\] = useState<'([^']+)'\>\('dashboard'\);/, 
    "const [activeTab, setActiveTab] = useState<'$1' | 'payroll' | 'promotions' | 'branches'>('dashboard');"
  );
}

// Icons
if (!code.includes("Calculator,")) {
  code = code.replace(/import \{ ScanBarcode,/, "import { ScanBarcode, Calculator, Tag, Store,");
}

// Sidebar links
const newLinks = `
              <SidebarItem icon={Store} label="Branches" active={activeTab === 'branches'} onClick={() => setActiveTab('branches')} />
              <SidebarItem icon={Tag} label="Promotions" active={activeTab === 'promotions'} onClick={() => setActiveTab('promotions')} />
              <SidebarItem icon={Calculator} label="Payroll" active={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')} />
`;

if (!code.includes("activeTab === 'branches'")) {
  code = code.replace(/<SidebarItem icon=\{BarChart3\} label="Reports"/, newLinks + '\n              <SidebarItem icon={BarChart3} label="Reports"');
}

// Screen components
const newScreens = `
            {activeTab === 'payroll' && <PayrollScreen />}
            {activeTab === 'promotions' && <PromotionsScreen products={products} />}
            {activeTab === 'branches' && <BranchesScreen />}
`;

if (!code.includes("<PayrollScreen />")) {
  code = code.replace(/\{activeTab === 'staff' && <StaffScreen \/>\}/, "{activeTab === 'staff' && <StaffScreen />}\n" + newScreens);
}

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched with Enterprise screens");
