const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /window\.location\.reload\(\);\s*\}\s*if \(currentUser/g,
  "window.location.reload();\n    }} />;\n  }\n\n  if (currentUser"
);

fs.writeFileSync('src/App.tsx', code);
