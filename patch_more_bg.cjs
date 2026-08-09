const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');


code = code.replace(/bg-slate-100([^a-z])/g, 'bg-slate-100 dark:bg-slate-800$1');
code = code.replace(/bg-[#F8FAFC]/g, 'bg-[#F8FAFC] dark:bg-[#020617]');

code = code.replace(/text-slate-800([^a-z])/g, 'text-slate-800 dark:text-slate-200$1');
code = code.replace(/text-slate-900([^a-z])/g, 'text-slate-900 dark:text-slate-100$1');

fs.writeFileSync('src/App.tsx', code);
