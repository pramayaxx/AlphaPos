const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Imports
code = code.replace(
  "import { useTheme } from './ThemeContext';",
  "import { useTheme } from './ThemeContext';\nimport { useTranslation } from './i18n';\nimport { ReservationsScreen } from './ReservationsScreen';"
);

// Sidebar uses strings, we need to pass `t`
// Actually, App.tsx has its own language logic now.
code = code.replace("export default function App() {", "export default function App() {\n  const { t, language, setLanguage } = useTranslation();");

// Replace string literals with `t('key')` where easy
code = code.replace(/>Dashboard</g, ">{t('dashboard')}<");
code = code.replace(/>Checkout</g, ">{t('checkout')}<");
code = code.replace(/>Products</g, ">{t('products')}<");
code = code.replace(/>Customers</g, ">{t('customers')}<");
code = code.replace(/>Reports</g, ">{t('reports')}<");
code = code.replace(/>Settings</g, ">{t('settings')}<");
code = code.replace(/>Staff</g, ">{t('staff')}<");
code = code.replace(/>Tables</g, ">{t('tables')}<");
code = code.replace(/>KDS</g, ">{t('kds')}<");
code = code.replace(/>Online Orders</g, ">{t('online_orders')}<");

// Add Reservations tab to sidebar
const tablesTab = `
              <button
                onClick={() => setActiveTab('tables')}
                className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 \${activeTab === 'tables' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}\`}
              >
                <Grid size={20} />
                <span className="font-medium">{t('tables')}</span>
              </button>`;
const reservationsTab = `
              <button
                onClick={() => setActiveTab('reservations')}
                className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 \${activeTab === 'reservations' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}\`}
              >
                <Calendar size={20} />
                <span className="font-medium">{t('reservations' as any)}</span>
              </button>`;

code = code.replace(tablesTab, tablesTab + reservationsTab);

// Add component render
const tablesRender = "{activeTab === 'tables' && <TablesScreen onTableSelect={(t) => {";
const reservationsRender = "{activeTab === 'reservations' && <ReservationsScreen tables={[]} />}\n            ";
code = code.replace(tablesRender, reservationsRender + tablesRender);

// Add Language Switcher near Theme Toggle
const themeToggle = `<button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">`;
const languageSelect = `
          <select 
            value={language} 
            onChange={e => setLanguage(e.target.value as 'en'|'si'|'ta')}
            className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer dark:text-slate-300 mr-2"
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
`;
code = code.replace(themeToggle, languageSelect + themeToggle);

fs.writeFileSync('src/App.tsx', code);
