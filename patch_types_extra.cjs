const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf-8');

code += `\n
export interface AttendanceRecord {
  id: string;
  staff_id: string;
  staff_name: string;
  clock_in: string;
  clock_out?: string;
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  product_id: string;
  product_name: string;
  current_product_name?: string;
  change_amount: number;
  reason: string;
  created_at: string;
}
`;

fs.writeFileSync('src/db.ts', code);
console.log("Patched db.ts with Attendance & Adjustments");
