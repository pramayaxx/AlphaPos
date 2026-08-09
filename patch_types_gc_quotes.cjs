const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf-8');

code += `\n
export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  issued_at: string;
  is_active: boolean;
}

export interface Quote {
  id: string;
  uuid: string;
  customer_id?: string;
  date_time: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  tax_amount?: number;
  tax_rate?: number;
  grand_total: number;
  status: 'pending' | 'accepted' | 'rejected' | 'invoiced';
}
`;

fs.writeFileSync('src/db.ts', code);
console.log("Patched db.ts for GC and Quotes");
