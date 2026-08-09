const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /\{activeTab === 'settings' && <ShopSettingsScreen[\s\S]*?\/\}/,
  "{activeTab === 'settings' && <ShopSettingsScreen onPrinterSetup={() => setActiveTab('printer-setup')} currentUser={currentUser} settings={settings} setSettings={setSettings} />}\n" +
  "            {activeTab === 'printer-setup' && <PrinterSetup onBack={() => setActiveTab('settings')} />}\n" +
  "            {activeTab === 'pending-prints' && <PendingPrints bills={bills} settings={settings} onBack={() => setActiveTab('dashboard')} onSaleComplete={fetchData} />}\n" +
  "          </motion.div>\n" +
  "        </AnimatePresence>\n" +
  "      </main>\n"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed App.tsx missing closing tags.");
