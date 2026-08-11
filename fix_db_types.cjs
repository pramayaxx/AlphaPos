const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf-8');

code = code.replace(
  "taxName?: string;",
  "taxName?: string;\n  enable_loyalty_tiers?: boolean;\n  scale_integration?: boolean;\n  barcode_scanner_mode?: boolean;"
);

fs.writeFileSync('src/db.ts', code);
