const fs = require('fs');
let code = fs.readFileSync('src/BarcodeScreen.tsx', 'utf-8');
code = code.replace(/content: \(\) => printRef\.current,/, "contentRef: printRef,");
// also fix if the previous replacement got messed up:
code = code.replace(/contentRef: componentRef,/, "");
fs.writeFileSync('src/BarcodeScreen.tsx', code);
console.log("Fixed useReactToPrint in BarcodeScreen.tsx");
