const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'className="flex h-[100dvh] bg-slate-900 items-center justify-center"',
  'className="flex h-[100dvh] bg-slate-50 dark:bg-slate-900 items-center justify-center"'
);

content = content.replace(
  'className="bg-slate-800 p-8 rounded-3xl max-w-md w-full text-center"',
  'className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full text-center shadow-xl"'
);

content = content.replace(
  'className="text-2xl font-black text-white mb-6"',
  'className="text-2xl font-black text-slate-900 dark:text-white mb-6"'
);

content = content.replace(
  'className="bg-slate-700 hover:bg-slate-600 text-white font-bold p-4 rounded-2xl flex flex-col items-center gap-2"',
  'className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors"'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
