const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /\$\{s\.syncProvider\}/g,
  "'cloud'"
);

code = code.replace(
  /\$\{s\.liveSync\}/g,
  "true"
);

fs.writeFileSync('server.ts', code);
