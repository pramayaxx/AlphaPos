const fs = require('fs');
let code = fs.readFileSync('src/AttendanceScreen.tsx', 'utf-8');

code = code.replace("import { type AttendanceRecord, type User } from './db';", "import { type AttendanceRecord } from './db';");

fs.writeFileSync('src/AttendanceScreen.tsx', code);
