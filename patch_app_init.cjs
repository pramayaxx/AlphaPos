const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /showDateTime: true,\s*syncProvider: 'none',\s*liveSync: false/g,
  "showDateTime: true"
);

fs.writeFileSync('src/App.tsx', code);
