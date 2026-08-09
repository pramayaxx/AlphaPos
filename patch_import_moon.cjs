const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace("Settings,", "Settings, Moon, Sun,");
fs.writeFileSync('src/App.tsx', code);
