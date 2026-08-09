const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add backup/restore to SettingsScreen
const backupSection = `
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Data Management</h3>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Export your store data as a JSON file or restore from a previous backup.</p>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={async () => {
                  try {
                    const data = await api.get('/backup/export');
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`pos_backup_\${new Date().toISOString().split('T')[0]}.json\`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } catch(e: any) {
                    alert('Export failed: ' + e.message);
                  }
                }}
                className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-4 py-2 rounded-xl font-bold transition-colors text-sm"
              >
                Export Data (Backup)
              </button>
            </div>
          </div>
        </div>
`;
code = code.replace(/<\/form>\n    <\/div>\n  \);\n};\n/, backupSection + "\n      </form>\n    </div>\n  );\n};\n");

// 2. Add useTheme hook import and usage in MainLayout
if (!code.includes("import { useTheme }")) {
  code = code.replace(/import \{ ThemeProvider \} from '\.\/ThemeContext';/, "import { ThemeProvider, useTheme } from './ThemeContext';");
}

code = code.replace(/const MainLayout = \(\{ children, currentUser,[\s\S]*?\{/, (match) => {
  return match + "\n  const { theme, toggleTheme } = useTheme();\n";
});

// Add theme toggle button in Sidebar
const themeToggleBtn = `
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={toggleTheme}
            className="w-full mb-4 flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-colors"
          >
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Theme</span>
            {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-blue-500" />}
          </button>
`;
code = code.replace(/<div className="pt-6 border-t border-slate-100 dark:border-slate-800">/, themeToggleBtn);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with Backup and Theme Toggle");
