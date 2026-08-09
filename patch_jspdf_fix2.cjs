const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /orientation: 'portrait' \}/,
  "orientation: 'portrait' as const }"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for jsPDF orientation");
