const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/console\.error\(err\);\s*res\.status\(500\)\.json\(\{ error: 'Server Error' \}\);/, 
  "console.error('SERVER ERROR IN PUBLIC BILLS:', err);\n    res.status(500).json({ error: 'Server Error', details: String(err) });");

fs.writeFileSync('server.ts', code);
