const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf-8');

code = code.replace(/export interface PurchaseOrder \{\n  id\?: string;\n  supplier_id: string;\n  product_id: string;\n  quantity: number;\n  cost_price: number;\n  date_time: Date;\n  status: 'pending' \| 'received';\n\}/, "");

fs.writeFileSync('src/db.ts', code);
