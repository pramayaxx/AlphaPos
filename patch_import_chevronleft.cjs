const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace("ChevronRight,", "ChevronRight, ChevronLeft,");
fs.writeFileSync('src/App.tsx', code);
