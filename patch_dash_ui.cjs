const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regexIncomeCard = /<StatsCard label="Monthly Income" value=\{formatCurrency\(stats\.monthlyIncome\)\} icon=\{LayoutDashboard\} colorClass="bg-emerald-500" \/>/;
const repIncomeCard = `<StatsCard label="Monthly Income" value={formatCurrency(stats.monthlyIncome)} icon={LayoutDashboard} colorClass="bg-emerald-500">
          <div className="h-10 mt-2">
            <LineChart width={120} height={40} data={weeklyTrend}>
              <Line type="monotone" dataKey="uv" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </div>
        </StatsCard>`;
code = code.replace(regexIncomeCard, repIncomeCard);

const topProductsCode = `<div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Top Selling Products</h3>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((tp, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 font-bold shadow-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">{tp.name}</p>
                    </div>
                  </div>
                  <p className="font-black text-slate-900 dark:text-slate-100 dark:text-slate-100">{tp.sales} sold</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No sales data yet.</p>
            )}
          </div>
        </div>`;

const recentTxCode = /<div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">\s*<h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Recent Transactions<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">\s*<h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Inventory Status<\/h3>/;

code = code.replace(
  /<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">/, 
  `<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">`
);

code = code.replace(
  /<div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">\s*<h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Inventory Status<\/h3>/, 
  `${topProductsCode}\n        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">\n          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">Inventory Status</h3>`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched dashboard UI successfully!");
