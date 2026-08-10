const fs = require('fs');

const fixWindowApi = (file) => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf-8');
    // Replace (window as any).api with api
    code = code.replace(/\(window as any\)\.api/g, 'api');
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

console.log("Fixed window api issues.");
