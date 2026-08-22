const fs = require('fs');
let code = fs.readFileSync('src/ShopSettingsScreen.tsx', 'utf8');

const loyaltyUI = `
             </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center">
                 <CreditCard size={24} />
               </div>
               <h3 className="text-xl font-black dark:text-white">Loyalty Program</h3>
             </div>
             
             <div className="space-y-6">
               <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                 <input 
                   type="checkbox" 
                   checked={settings.enableLoyalty || false}
                   onChange={e => setSettings({...settings, enableLoyalty: e.target.checked})}
                   className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                 />
                 <span className="font-bold text-slate-700 dark:text-slate-300">Enable Customer Loyalty Points</span>
               </label>
               
               {settings.enableLoyalty && (
                 <div className="grid md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                   <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Points Earned per Amount</label>
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-slate-500">Every</span>
                       <input 
                         type="number" 
                         value={settings.amountPerPoint || 0}
                         onChange={e => setSettings({...settings, amountPerPoint: Number(e.target.value)})}
                         className="w-24 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                         placeholder="100"
                       />
                       <span className="text-sm font-bold text-slate-500">spent = 1 Point</span>
                     </div>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Discount Value per Point</label>
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-slate-500">1 Point =</span>
                       <input 
                         type="number" 
                         value={settings.valuePerPoint || 0}
                         onChange={e => setSettings({...settings, valuePerPoint: Number(e.target.value)})}
                         className="w-24 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                         placeholder="1"
                       />
                       <span className="text-sm font-bold text-slate-500">discount</span>
                     </div>
                   </div>
                 </div>
               )}
`;

code = code.replace(/<\/div>\s*<\/div>\s*<div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200\/20 dark:shadow-none">\s*<div className="flex items-center gap-3 mb-6">\s*<div className="w-12 h-12 bg-rose-100 dark:bg-rose-900\/30 text-rose-600 rounded-2xl flex items-center justify-center">/g, 
  loyaltyUI + `             </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl flex items-center justify-center">`);

fs.writeFileSync('src/ShopSettingsScreen.tsx', code);
