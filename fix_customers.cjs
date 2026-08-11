const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldTr = `
                <tr key={customer.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-4 text-slate-800 dark:text-slate-200">
                    <div className="font-medium">{customer.name}</div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{customer.phone || '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{customer.email || '-'}</td>
                  <td className="p-4 text-slate-800 dark:text-slate-200 font-bold">\${totalSpent.toFixed(2)}</td>
                  <td className="p-4 text-slate-800 dark:text-slate-200 font-bold text-red-500">\${totalDebt.toFixed(2)}</td>
                  <td className="p-4 text-right">
`;

const newTr = `
                <tr key={customer.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-4 text-slate-800 dark:text-slate-200">
                    <div className="font-medium">{customer.name}</div>
                    {settings?.enable_loyalty_tiers && (
                       <span className={\`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium \${
                         totalSpent > 1000 ? 'bg-yellow-100 text-yellow-800' :
                         totalSpent > 500 ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-800'
                       }\`}>
                         {totalSpent > 1000 ? 'Gold' : totalSpent > 500 ? 'Silver' : 'Bronze'}
                       </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{customer.phone || '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{customer.email || '-'}</td>
                  <td className="p-4 text-slate-800 dark:text-slate-200 font-bold">\${totalSpent.toFixed(2)}</td>
                  <td className="p-4 text-slate-800 dark:text-slate-200 font-bold text-red-500">\${totalDebt.toFixed(2)}</td>
                  <td className="p-4 text-right">
`;

code = code.replace(oldTr, newTr);
fs.writeFileSync('src/App.tsx', code);
