const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /jsPDF: \{ unit: 'mm', format: \[settings\?\.receiptWidth === 80 \? 80 : 58, 200\], orientation: 'portrait' \}/,
  "jsPDF: { unit: 'mm', format: [settings?.receiptWidth === 80 ? 80 : 58, 200] as [number, number], orientation: 'portrait' }"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for jsPDF format");
