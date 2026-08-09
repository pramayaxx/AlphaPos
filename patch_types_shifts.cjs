const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf-8');

code += `\n
export interface CashShift {
  id: string;
  opened_by: string;
  closed_by?: string;
  opened_at: string;
  closed_at?: string;
  opening_balance: number;
  closing_balance?: number;
  expected_balance?: number;
  notes?: string;
  status: 'open' | 'closed';
}
`;

fs.writeFileSync('src/db.ts', code);
console.log("Patched db.ts with Shifts");
