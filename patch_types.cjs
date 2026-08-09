const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf-8');

code += `\n
export interface Supplier {
  id?: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface PurchaseOrder {
  id?: string;
  supplier_id: string;
  product_id: string;
  quantity: number;
  cost_price: number;
  date_time: Date;
  status: 'pending' | 'received';
}
`;

fs.writeFileSync('src/db.ts', code);
console.log("Patched db.ts");
