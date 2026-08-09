const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
if (!code.includes("import html2canvas from 'html2canvas'")) {
    code = code.replace("import html2pdf from 'html2pdf.js';", "import html2pdf from 'html2pdf.js';\nimport html2canvas from 'html2canvas';");
    fs.writeFileSync('src/App.tsx', code);
}
console.log("Patched import");
