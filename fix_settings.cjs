const fs = require('fs');
let code = fs.readFileSync('src/ShopSettingsScreen.tsx', 'utf-8');

const newFields = `
              <h3 className="font-bold text-lg mt-6">Hardware & Features</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.scale_integration} onChange={e => setFormData({...formData, scale_integration: e.target.checked})} />
                  Enable Weight Scale Integration
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.barcode_scanner_mode} onChange={e => setFormData({...formData, barcode_scanner_mode: e.target.checked})} />
                  Enable Direct Barcode Scanner Mode
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.enable_loyalty_tiers} onChange={e => setFormData({...formData, enable_loyalty_tiers: e.target.checked})} />
                  Enable Customer Loyalty Tiers
                </label>
              </div>
`;

if (!code.includes('Hardware & Features')) {
  // Find where to insert, maybe after </form> or inside it.
  const insertTarget = '<button type="submit" className="w-full bg-indigo-600';
  code = code.replace(insertTarget, newFields + '\n              ' + insertTarget);
  fs.writeFileSync('src/ShopSettingsScreen.tsx', code);
}
