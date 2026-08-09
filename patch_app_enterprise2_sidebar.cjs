const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Imports
const newImports = `
import ShiftsScreen from './ShiftsScreen';
import RecipesScreen from './RecipesScreen';
import InvoicesScreen from './InvoicesScreen';
`;

if (!code.includes("import ShiftsScreen")) {
  code = code.replace(/import VariantsScreen from '\.\/VariantsScreen';/, "import VariantsScreen from './VariantsScreen';\n" + newImports);
}

// activeTab type
if (!code.includes("activeTab === 'shifts'")) {
  code = code.replace(
    /const \[activeTab, setActiveTab\] = useState<'([^']+)'\>\('dashboard'\);/, 
    "const [activeTab, setActiveTab] = useState<'$1' | 'shifts' | 'recipes' | 'invoices'>('dashboard');"
  );
}

// Icons
if (!code.includes("Clock,")) {
  code = code.replace(/import \{ ScanBarcode,/, "import { ScanBarcode, Clock, Utensils, FileText,");
}

// Sidebar links
const newLinks = `
              <SidebarItem icon={Clock} label="Shifts" active={activeTab === 'shifts'} onClick={() => setActiveTab('shifts')} />
              <SidebarItem icon={Utensils} label="Recipes" active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
              <SidebarItem icon={FileText} label="Invoices" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
`;

if (!code.includes("activeTab === 'shifts'")) {
  code = code.replace(/<SidebarItem icon=\{PackageMinus\} label="Stock Audits"/, newLinks + '\n              <SidebarItem icon={PackageMinus} label="Stock Audits"');
}

// Screen components
const newScreens = `
            {activeTab === 'shifts' && <ShiftsScreen />}
            {activeTab === 'recipes' && <RecipesScreen products={products} />}
            {activeTab === 'invoices' && <InvoicesScreen />}
`;

if (!code.includes("<ShiftsScreen")) {
  code = code.replace(/\{activeTab === 'adjustments' && <StockAdjustmentsScreen/, newScreens + "\n            {activeTab === 'adjustments' && <StockAdjustmentsScreen");
}

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched with Enterprise 2 screens");
