const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/discountValue,\n\s*pointsRedeemed: usePoints \? maxPointsToUse : 0,/g, "discountValue,");
fs.writeFileSync('src/App.tsx', code);
