const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/shopName/g, 'name');

const patchCode = `
  patch: async (endpoint: string, data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(\`\${API_URL}\${endpoint}\`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
       const text = await res.text();
       try { const json = JSON.parse(text); throw new Error(json.message || text); } catch(e) { throw new Error(text); }
    }
    return res.json();
  },
`;

code = code.replace(/delete: async/, patchCode + '  delete: async');

fs.writeFileSync('src/App.tsx', code);
