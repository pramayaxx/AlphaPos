const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /className="p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm font-mono leading-relaxed mx-auto"/,
  'className="p-10 bg-white text-black border border-slate-200 rounded-2xl shadow-sm font-mono leading-relaxed mx-auto"'
);
code = code.replace(
  /dark:text-slate-100/g,
  ""
);
// wait, removing `dark:text-slate-100` globally will break other components!
