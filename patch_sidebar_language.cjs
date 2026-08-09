const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const langToggle = `
  const [lang, setLang] = useState<'EN' | 'SI' | 'TA'>('EN');

  const dict: any = {
    'EN': { pos: 'ALPHA POS', dash: 'Dashboard', checkout: 'Checkout', prod: 'Products', cust: 'Customers' },
    'SI': { pos: 'ඇල්ෆා POS', dash: 'පාලක පුවරුව', checkout: 'අයකැමි', prod: 'භාණ්ඩ', cust: 'පාරිභෝගිකයින්' },
    'TA': { pos: 'ஆல்ஃபா POS', dash: 'முகப்பு', checkout: 'காசாளர்', prod: 'பொருட்கள்', cust: 'வாடிக்கையாளர்கள்' }
  };
  const t = dict[lang];
`;

if (!code.includes('setLang')) {
  code = code.replace(/const \[activeTab, setActiveTab\] = useState/, langToggle + "\n  const [activeTab, setActiveTab] = useState");
  
  // Replace the POS text
  code = code.replace(/<div className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">ALPHA POS<\/div>/, `<div className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">{t.pos}</div>`);

  // add toggle buttons in sidebar
  code = code.replace(/<button onClick=\{toggleTheme\}/, `
          <div className="flex gap-2 mb-4 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
             <button onClick={() => setLang('EN')} className={\`flex-1 text-xs font-bold py-2 rounded-lg \${lang === 'EN' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}\`}>EN</button>
             <button onClick={() => setLang('SI')} className={\`flex-1 text-xs font-bold py-2 rounded-lg \${lang === 'SI' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}\`}>සිං</button>
             <button onClick={() => setLang('TA')} className={\`flex-1 text-xs font-bold py-2 rounded-lg \${lang === 'TA' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}\`}>தமிழ்</button>
          </div>
          <button onClick={toggleTheme}
  `);

  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx with language toggle.");
}
