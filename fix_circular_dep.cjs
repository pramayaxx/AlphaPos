const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');

// Extract api from App.tsx
const apiMatch = appCode.match(/export const api = \{[\s\S]*?^\};/m);
if (apiMatch) {
    const apiCode = `
export const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api' + endpoint, {
      headers: { ...(token ? { Authorization: \`Bearer \${token}\` } : {}) }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async (endpoint: string, data?: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api' + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: \`Bearer \${token}\` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  put: async (endpoint: string, data?: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api' + endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: \`Bearer \${token}\` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  patch: async (endpoint: string, data?: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api' + endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: \`Bearer \${token}\` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  delete: async (endpoint: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api' + endpoint, {
      method: 'DELETE',
      headers: { ...(token ? { Authorization: \`Bearer \${token}\` } : {}) }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
`;
    fs.writeFileSync('src/api.ts', apiCode);
    appCode = appCode.replace(apiMatch[0], "");
    appCode = "import { api } from './api';\n" + appCode;
    // Fix ReportsScreen color issue as well (purple -> violet)
    appCode = appCode.replace(/color="purple"/g, 'color="blue"');
    fs.writeFileSync('src/App.tsx', appCode);
}

// Update imports in other files
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
    code = code.replace(/import \{ api \} from '\.\/App';/g, "import { api } from './api';");
    fs.writeFileSync(file, code);
});
console.log("Fixed circular dependency.");
