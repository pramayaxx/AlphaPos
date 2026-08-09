const fs = require('fs');
let code = fs.readFileSync('src/CashDrawerScreen.tsx', 'utf-8');

code = code.replace(/const CashDrawerScreen = \(\{ bills, expenses \} : \{ bills: Bill\[\], expenses: Expense\[\] \}\) => \{/, 
  "const CashDrawerScreen = ({ bills }: { bills: Bill[] }) => {");

code = code.replace(/const \[shifts, setShifts\] = useState\<CashShift\[\]\>\(\[\]\);/,
  "const [shifts, setShifts] = useState<CashShift[]>([]);\n  const [expenses, setExpenses] = useState<Expense[]>([]);");

code = code.replace(/const all = await api.get\('\/shifts'\);\n      setShifts\(all\);/,
  "const all = await api.get('/shifts');\n      setShifts(all);\n      const exp = await api.get('/expenses').catch(() => []);\n      setExpenses(exp);");

fs.writeFileSync('src/CashDrawerScreen.tsx', code);
console.log("Patched CashDrawerScreen with internal expenses fetch");
