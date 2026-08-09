const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf8');
code = code.replace(
  "role: 'admin' | 'cashier' | 'guest';",
  "role: 'admin' | 'cashier' | 'manager' | 'guest';"
);
fs.writeFileSync('src/db.ts', code);

code = fs.readFileSync('src/StaffScreen.tsx', 'utf8');
code = code.replace(
  '<option value="cashier">Cashier</option>',
  '<option value="cashier">Cashier</option>\n                  <option value="manager">Manager</option>'
);
code = code.replace(
  "member.role === 'admin' ? 'bg-amber-500' : 'bg-blue-500'",
  "member.role === 'admin' ? 'bg-amber-500' : member.role === 'manager' ? 'bg-indigo-500' : 'bg-blue-500'"
);
code = code.replace(
  "member.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'",
  "member.role === 'admin' ? 'bg-amber-100 text-amber-700' : member.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'"
);
fs.writeFileSync('src/StaffScreen.tsx', code);
