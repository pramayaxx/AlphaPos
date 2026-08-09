const fs = require('fs');
let code = fs.readFileSync('src/StaffScreen.tsx', 'utf8');

code = code.replace(
  "await api.delete(\\\`/staff/\\\${id}\\\`);",
  "await api.delete(\`/staff/${id}\`);"
);

code = code.replace(
  "className={\\`w-10 h-10",
  "className={\`w-10 h-10"
);

code = code.replace(
  "\\${member.role === 'admin' ? 'bg-amber-500' : 'bg-blue-500'}\\`}",
  "${member.role === 'admin' ? 'bg-amber-500' : 'bg-blue-500'}\`}"
);

code = code.replace(
  "className={\\`px-2.5",
  "className={\`px-2.5"
);

code = code.replace(
  "\\${member.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}\\`}",
  "${member.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}\`}"
);

fs.writeFileSync('src/StaffScreen.tsx', code);
