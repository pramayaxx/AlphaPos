const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf-8');

code += `\n
export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_purchase: number;
  valid_until?: string;
  is_active: boolean;
}
`;

fs.writeFileSync('src/db.ts', code);
console.log("Patched db.ts with Coupons");
