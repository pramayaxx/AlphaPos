const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace("import { cn, formatCurrency } from './lib/utils';", "import { cn, formatCurrency } from './lib/utils';\nimport html2pdf from 'html2pdf.js';");
fs.writeFileSync('src/App.tsx', code);
console.log("Patched imports");
