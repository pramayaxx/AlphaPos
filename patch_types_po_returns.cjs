const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf-8');

code += `\n
export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name?: string;
  order_date: string;
  expected_date?: string;
  items: any[];
  total_amount: number;
  status: 'pending' | 'received' | 'cancelled';
  notes?: string;
}

export interface Return {
  id: string;
  bill_id: string;
  original_bill_uuid?: string;
  return_date: string;
  items: any[];
  refund_amount: number;
  reason: string;
}
`;

fs.writeFileSync('src/db.ts', code);
console.log("Patched db.ts for POs and Returns");
