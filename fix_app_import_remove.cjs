const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace('import { PublicBillScreen } from "./PublicBillScreen";\n', '');

fs.writeFileSync('src/App.tsx', code);
