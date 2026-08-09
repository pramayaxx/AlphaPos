const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const apiObj = `
export const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(\`\${API_URL}\${endpoint}\`, {
      headers: { 'Authorization': \`Bearer \${token}\` }
    });
    if (!res.ok) {
       const text = await res.text();
       try { const json = JSON.parse(text); throw new Error(json.message || text); } catch(e) { throw new Error(text); }
    }
    return res.json();
  },
  post: async (endpoint: string, data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(\`\${API_URL}\${endpoint}\`, {
      method: 'POST',
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
  put: async (endpoint: string, data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(\`\${API_URL}\${endpoint}\`, {
      method: 'PUT',
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
  delete: async (endpoint: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(\`\${API_URL}\${endpoint}\`, {
      method: 'DELETE',
      headers: { 'Authorization': \`Bearer \${token}\` }
    });
    if (!res.ok) {
       const text = await res.text();
       try { const json = JSON.parse(text); throw new Error(json.message || text); } catch(e) { throw new Error(text); }
    }
    return res.json();
  }
};
`;

code = code.replace(/export const api = \{[\s\S]*?delete: async \(endpoint: string\) => \{[\s\S]*?return res\.json\(\);\s*\}\s*\};/, apiObj.trim());

fs.writeFileSync('src/App.tsx', code);
