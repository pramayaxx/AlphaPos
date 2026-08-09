const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /{currentUser\.role === 'admin' && \(/g,
  "{['admin', 'manager'].includes(currentUser.role) && ("
);
fs.writeFileSync('src/App.tsx', code);
