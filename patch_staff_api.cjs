const fs = require('fs');
let code = fs.readFileSync('src/StaffScreen.tsx', 'utf8');
code = code.replace("import api from './db';", "import { api } from './db';");
fs.writeFileSync('src/StaffScreen.tsx', code);
