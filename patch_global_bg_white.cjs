const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Use a regex to replace bg-white with bg-white dark:bg-slate-900 globally, 
// and text-slate-800/900 with dark:text-slate-100 where it makes sense
code = code.replace(/bg-white([^/])/g, 'bg-white dark:bg-slate-900$1');
code = code.replace(/text-slate-900/g, 'text-slate-900 dark:text-slate-100');
code = code.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-200');
code = code.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-300');
code = code.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
code = code.replace(/bg-slate-50([^/])/g, 'bg-slate-50 dark:bg-slate-800$1');
code = code.replace(/bg-slate-100([^/])/g, 'bg-slate-100 dark:bg-slate-800$1');
code = code.replace(/bg-slate-200([^/])/g, 'bg-slate-200 dark:bg-slate-700$1');
code = code.replace(/border-slate-100([^/])/g, 'border-slate-100 dark:border-slate-800$1');
code = code.replace(/border-slate-200([^/])/g, 'border-slate-200 dark:border-slate-700$1');


fs.writeFileSync('src/App.tsx', code);
