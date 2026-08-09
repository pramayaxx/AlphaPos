const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/\\`Greetings from/g, '`Greetings from');
code = code.replace(/\$\{billUrl\}\\`/g, '${billUrl}`');

fs.writeFileSync('src/App.tsx', code);
