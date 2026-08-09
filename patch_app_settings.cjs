const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// replace import or add it
if (!code.includes('import ShopSettingsScreen')) {
  code = code.replace(/import SuperAdminScreen/, "import ShopSettingsScreen from './ShopSettingsScreen';\nimport SuperAdminScreen");
}

// replace component usage
code = code.replace(
  /\{activeTab === 'settings' && <SettingsScreen[\s\S]*?\/\}/,
  "{activeTab === 'settings' && <ShopSettingsScreen onPrinterSetup={() => setActiveTab('printer-setup')} currentUser={currentUser} settings={settings} setSettings={setSettings} />}"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for ShopSettingsScreen");
