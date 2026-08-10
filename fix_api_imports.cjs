const fs = require('fs');

const files = [
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

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf-8');
    if (code.includes('api.') && !code.includes("import { api }")) {
        code = "import { api } from './App';\n" + code;
        fs.writeFileSync(file, code);
    }
});
console.log("Fixed imports");
