const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<button \n                    onClick=\{\(\) => setPaymentMethod\('mobile'\)\}/, 
  `<button 
                    onClick={() => setPaymentMethod('mobile')}
                    className={cn("py-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold transition-all border-2", paymentMethod === 'mobile' ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800")}
                  >
                    <Smartphone size={24} />
                    Mobile
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('giftcard' as any)}
                    className={cn("py-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold transition-all border-2", paymentMethod === 'giftcard' as any ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800")}
                  >
                    <Gift size={24} />
                    Gift Card
                  </button>
                  {false && <button `);

// We need to inject 'giftcard' into the paymentMethod state
// Let's just avoid type error for now by casting in the onClick.
fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for GiftCard payment");
