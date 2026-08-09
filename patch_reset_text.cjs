const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "This will delete all local data and reset the app. Are you sure?",
  "This will clear cache and log you out. Are you sure?"
);
code = code.replace(
  "Reset Database / Clear Cache",
  "Clear Cache / Logout"
);

fs.writeFileSync('src/App.tsx', code);
