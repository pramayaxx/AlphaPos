const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Imports
const newImports = `
import VariantsScreen from './VariantsScreen';
`;

if (!code.includes("import VariantsScreen")) {
  code = code.replace(/import BranchesScreen from '\.\/BranchesScreen';/, "import BranchesScreen from './BranchesScreen';\n" + newImports);
}

// activeTab type
if (!code.includes("activeTab === 'variants'")) {
  code = code.replace(
    /const \[activeTab, setActiveTab\] = useState<'([^']+)'\>\('dashboard'\);/, 
    "const [activeTab, setActiveTab] = useState<'$1' | 'variants'>('dashboard');"
  );
}

// Icons
if (!code.includes("Layers,")) {
  code = code.replace(/import \{ ScanBarcode,/, "import { ScanBarcode, Layers,");
}

// Sidebar links
const newLinks = `
              <SidebarItem icon={Layers} label="Variants" active={activeTab === 'variants'} onClick={() => setActiveTab('variants')} />
`;

if (!code.includes("activeTab === 'variants'")) {
  code = code.replace(/<SidebarItem icon=\{PackageMinus\} label="Stock Audits"/, newLinks + '\n              <SidebarItem icon={PackageMinus} label="Stock Audits"');
}

// Screen components
const newScreens = `
            {activeTab === 'variants' && <VariantsScreen products={products} />}
`;

if (!code.includes("<VariantsScreen")) {
  code = code.replace(/\{activeTab === 'adjustments' && <StockAdjustmentsScreen/, newScreens + "\n            {activeTab === 'adjustments' && <StockAdjustmentsScreen");
}

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched with Variants screen");
