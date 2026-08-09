const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const StatsCard = \(\{\s*label,\s*value,\s*icon:\s*Icon,\s*colorClass\s*\}\s*:\s*\{[^}]+\}\)\s*=>\s*\(\s*<div className="p-6[^>]+>([\s\S]*?)<\/div>\s*\);/m, 
`const StatsCard = ({ label, value, icon: Icon, colorClass, children }: { label: string, value: string | number, icon: any, colorClass: string, children?: React.ReactNode }) => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-xl", colorClass)}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100 mt-1">{value}</h3>
      </div>
    </div>
    {children && <div className="mt-4">{children}</div>}
  </div>
);`);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched StatsCard successfully!");
