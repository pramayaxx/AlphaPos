const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = "{activeTab === 'settings' && <ShopSettingsScreen onPrinterSetup={() => setActiveTab('printer-setup')} currentUser={currentUser} settings={settings} setSettings={setSettings} />}";

const replacementStr = "{activeTab === 'settings' && <ShopSettingsScreen onPrinterSetup={() => setActiveTab('printer-setup')} currentUser={currentUser} settings={settings} setSettings={setSettings} />}\n" +
  "            {activeTab === 'printer-setup' && <PrinterSetup onBack={() => setActiveTab('settings')} />}\n" +
  "            {activeTab === 'pending-prints' && <PendingPrints bills={bills} settings={settings} onBack={() => setActiveTab('dashboard')} onSaleComplete={fetchData} />}\n" +
  "          </motion.div>\n" +
  "        </AnimatePresence>\n" +
  "      </main>\n";

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully replaced missing tags!");
} else {
  console.log("Target string not found in App.tsx!");
}
