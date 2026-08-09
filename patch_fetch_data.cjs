const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /api\.get\('\/settings'\),/g,
  ""
);

code = code.replace(
  /const \[productsData, billsData, settingsData, customersData\] = await Promise\.all\(\[/g,
  "const [productsData, billsData, customersData] = await Promise.all(["
);

code = code.replace(
  /setSettings\(settingsData\);/g,
  ""
);

fs.writeFileSync('src/App.tsx', code);
