const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const pointsEarnedUI = `            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-end">
              <span className="text-slate-900 dark:text-slate-100 dark:text-slate-100 font-bold">Grand Total</span>
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal)}</span>
            </div>
            
            {pointsEarned > 0 && (
              <div className="flex justify-between items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 pt-2">
                <span>Loyalty Points Earned</span>
                <span>+{pointsEarned} Points</span>
              </div>
            )}
`;

code = code.replace(/<div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-end">\s*<span className="text-slate-900 dark:text-slate-100 dark:text-slate-100 font-bold">Grand Total<\/span>\s*<span className="text-3xl font-black text-blue-600 dark:text-blue-400">\{formatCurrency\(grandTotal\)\}<\/span>\s*<\/div>/g, 
  pointsEarnedUI);

fs.writeFileSync('src/App.tsx', code);
