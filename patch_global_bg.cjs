const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  '<div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">',
  '<div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] dark:bg-slate-950 dark:text-slate-100 text-slate-900 font-sans overflow-hidden">'
);

fs.writeFileSync('src/App.tsx', code);
