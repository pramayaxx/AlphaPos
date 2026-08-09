const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/shop\?\.shop_name/g, "shop?.name");
code = code.replace(/shop\.shop_name/g, "shop.name");

fs.writeFileSync('server.ts', code);
console.log("Patched PDF route");
