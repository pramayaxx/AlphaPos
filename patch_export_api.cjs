const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("const api = {", "export const api = {");
fs.writeFileSync('src/App.tsx', code);
