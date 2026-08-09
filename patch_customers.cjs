const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<table className="w-full text-left border-collapse">[\s\S]*?<\/table>/;
const match = code.match(regex);

if (match) {
  let tableCode = match[0];
  tableCode = tableCode.replace(/<th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Loyalty Points<\/th>/, 
    `<th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 hidden lg:table-cell">Loyalty Points</th>
     <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Debt</th>`);
     
  tableCode = tableCode.replace(/<td className="p-4 font-bold text-blue-600">\{c.loyalty_points \|\| 0\}<\/td>/,
    `<td className="p-4 font-bold text-blue-600 hidden lg:table-cell">{c.loyalty_points || 0}</td>
     <td className="p-4 font-black text-rose-500 text-right">{c.total_debt && c.total_debt > 0 ? formatCurrency(c.total_debt) : '-'}</td>`);

  code = code.replace(regex, tableCode);
}

// Now replace selected customer view
const detailsRegex = /<div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex gap-4 mt-2">[\s\S]*?<\/div>\s*<\/div>\s*<button onClick=\{\(\) => setSelectedCustomer\(null\)\}/;

const detailsReplacement = `<div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex gap-4 mt-2">
                    {selectedCustomer.phone && <span>{selectedCustomer.phone}</span>}
                    {selectedCustomer.email && <span>{selectedCustomer.email}</span>}
                  </div>
                </div>
                {selectedCustomer.total_debt && selectedCustomer.total_debt > 0 ? (
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unpaid Debt</span>
                    <span className="text-xl font-black text-rose-500">{formatCurrency(selectedCustomer.total_debt)}</span>
                    <button 
                      onClick={(e) => {
                         e.stopPropagation();
                         const amountStr = window.prompt(\`Enter amount to pay (Max: \${selectedCustomer.total_debt})\`);
                         if (amountStr) {
                           const amount = parseFloat(amountStr);
                           if (!isNaN(amount) && amount > 0) {
                             if (amount > (selectedCustomer.total_debt || 0)) {
                               alert('Amount exceeds total debt');
                               return;
                             }
                             api.post(\`/customers/\${selectedCustomer.id}/pay\`, { amount }).then(() => {
                               alert('Payment recorded!');
                               onAddCustomer(); // refetch
                               setSelectedCustomer(null);
                             }).catch(e => alert(e.message));
                           }
                         }
                      }}
                      className="mt-2 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-lg font-bold transition-colors"
                    >
                      Pay Debt
                    </button>
                  </div>
                ) : null}
                <button onClick={() => setSelectedCustomer(null)}`;

code = code.replace(detailsRegex, detailsReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Customers");
