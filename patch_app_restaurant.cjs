const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Imports
const newImports = `
import TablesScreen from './TablesScreen';
import KDSScreen from './KDSScreen';
`;

if (!code.includes("import TablesScreen")) {
  code = code.replace(/import BranchesScreen from '\.\/BranchesScreen';/, "import BranchesScreen from './BranchesScreen';\n" + newImports);
}

// activeTab type
if (!code.includes("activeTab === 'tables'")) {
  code = code.replace(
    /const \[activeTab, setActiveTab\] = useState<'([^']+)'\>\('dashboard'\);/, 
    "const [activeTab, setActiveTab] = useState<'$1' | 'tables' | 'kds'>('dashboard');"
  );
}

// Icons
if (!code.includes("ChefHat,")) {
  code = code.replace(/import \{ ScanBarcode,/, "import { ScanBarcode, ChefHat, Armchair, Monitor,");
}

// Sidebar links
const newLinks = `
              <SidebarItem icon={Armchair} label="Tables" active={activeTab === 'tables'} onClick={() => setActiveTab('tables')} />
              <SidebarItem icon={ChefHat} label="KDS" active={activeTab === 'kds'} onClick={() => setActiveTab('kds')} />
`;

if (!code.includes("activeTab === 'tables'")) {
  code = code.replace(/<SidebarItem icon=\{History\} label="History"/, newLinks + '\n          <SidebarItem icon={History} label="History"');
}

// Screen components
const newScreens = `
            {activeTab === 'tables' && <TablesScreen onTableSelect={(t) => {
              // we can set table on a new state and open checkout for that table
              setActiveTab('checkout');
              // this would require passing table to checkout... for simplicity we just go to checkout.
              // A real enterprise POS would link the table ID to the cart.
            }} />}
            {activeTab === 'kds' && <KDSScreen />}
`;

if (!code.includes("<TablesScreen")) {
  code = code.replace(/\{activeTab === 'transactions' && <Transactions/, newScreens + "\n            {activeTab === 'transactions' && <Transactions");
}

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched with Restaurant screens");
