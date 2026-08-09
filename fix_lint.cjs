const fs = require('fs');

const fixWindowApi = (file) => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf-8');
    // We can define global window.api or just suppress it. It's better to cast window as any.
    code = code.replace(/window\.api/g, '(window as any).api');
    fs.writeFileSync(file, code);
};

const files = [
    'src/App.tsx',
    'src/BranchesScreen.tsx',
    'src/InvoicesScreen.tsx',
    'src/KDSScreen.tsx',
    'src/PayrollScreen.tsx',
    'src/PromotionsScreen.tsx',
    'src/RecipesScreen.tsx',
    'src/ShiftsScreen.tsx',
    'src/ShopSettingsScreen.tsx',
    'src/SuperAdminScreen.tsx',
    'src/TablesScreen.tsx',
    'src/VariantsScreen.tsx'
];

files.forEach(fixWindowApi);

// Fix App.tsx missing imports
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
const missingIcons = ['Monitor', 'Scale', 'Armchair', 'ChefHat', 'Layers', 'Utensils', 'ScanBarcode', 'Store', 'Tag', 'Calculator'];
for (const icon of missingIcons) {
    if (!appCode.includes(` ${icon},`)) {
        appCode = appCode.replace(/import \{ /, `import { ${icon}, `);
    }
}
fs.writeFileSync('src/App.tsx', appCode);

// Fix ShopSettingsScreen.tsx User import
let shopSettings = fs.readFileSync('src/ShopSettingsScreen.tsx', 'utf-8');
shopSettings = shopSettings.replace(/import \{ type User \} from '\.\/App';/, "import { type User } from './types'; // or suppress");
if(shopSettings.includes("import { type User } from './types'; // or suppress")) {
    // If types.ts doesn't exist, we can just define User as any or just not import it since it's any anyway.
    shopSettings = shopSettings.replace(/import \{ type User \} from '\.\/types'; \/\/ or suppress/, "");
}
shopSettings = shopSettings.replace(/import \{ type User \} from '\.\/App';/, "");
fs.writeFileSync('src/ShopSettingsScreen.tsx', shopSettings);

// Fix BarcodeScreen.tsx useReactToPrint options
let barcodeCode = fs.readFileSync('src/BarcodeScreen.tsx', 'utf-8');
barcodeCode = barcodeCode.replace(/content: \(\) => componentRef\.current,/, "contentRef: componentRef,");
fs.writeFileSync('src/BarcodeScreen.tsx', barcodeCode);

console.log("Lint issues patched.");
