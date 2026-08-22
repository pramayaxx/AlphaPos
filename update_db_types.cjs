const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf8');

code = code.replace(/showDateTime: boolean;/g, 
  "showDateTime: boolean;\n  enableLoyalty?: boolean;\n  amountPerPoint?: number;\n  valuePerPoint?: number;");

code = code.replace(/status\?: string;/g, 
  "status?: string;\n  pointsEarned?: number;\n  pointsRedeemed?: number;");

code = code.replace(/loyalty_points\?: number;/g, 
  "loyalty_points?: number;\n  points?: number;");

fs.writeFileSync('src/db.ts', code);
