const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add state for Loyalty Points & Use Points
const stateAdd = `
  const [usePoints, setUsePoints] = useState(false);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
`;
code = code.replace("const [discountValue, setDiscountValue] = useState(0);", "const [discountValue, setDiscountValue] = useState(0);\n" + stateAdd);

// 2. Adjust Grand Total Calculation
const grandTotalCalc = `
  const taxAmount = (subtotal - discountAmount) * (settings.taxRate || 0) / 100;
  let baseGrandTotal = Math.max(0, subtotal - discountAmount + taxAmount);
  
  const selectedCustomerObj = customers.find(c => String(c.id) === String(selectedCustomerId));
  const availablePoints = selectedCustomerObj ? (selectedCustomerObj.loyalty_points || 0) : 0;
  
  // 1 point = 0.01 currency
  const pointValue = 0.01;
  const maxPointsToUse = Math.min(availablePoints, Math.floor(baseGrandTotal / pointValue));
  
  const pointsDiscount = usePoints ? maxPointsToUse * pointValue : 0;
  const grandTotal = Math.max(0, baseGrandTotal - pointsDiscount);
`;
code = code.replace(/const taxAmount =[\s\S]*?const grandTotal = Math\.max\(0, subtotal - discountAmount \+ taxAmount\);/m, grandTotalCalc);

// 3. Update handleConfirm to send points redeemed
const confirmData = `
        subtotal,
        discount: discountAmount,
        discountType,
        discountValue,
        pointsRedeemed: usePoints ? maxPointsToUse : 0,
`;
code = code.replace(/subtotal,\s*discount: discountAmount,\s*discountType,\s*discountValue,/m, confirmData);

// 4. Add UI for Using Points below the coupon input
const pointsUI = `
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    {selectedCustomerObj && availablePoints > 0 && (
                       <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4">
                         <div>
                           <div className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                             <Award size={18} /> Loyalty Points
                           </div>
                           <div className="text-sm text-blue-600 dark:text-blue-300">
                             {availablePoints} points available (={formatCurrency(availablePoints * pointValue)})
                           </div>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" checked={usePoints} onChange={e => setUsePoints(e.target.checked)} />
                           <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                         </label>
                       </div>
                    )}
                  </div>
`;

code = code.replace(/<div className="flex justify-between items-center text-slate-500 dark:text-slate-400">[\s]*<span>Tax/, pointsUI + '\n                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">\n                    <span>Tax');

// 5. Update Receipt Modal to have Email/SMS and Pay Online Buttons
const receiptModalButtons = `
          <button onClick={handlePrint} className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 flex flex-col items-center gap-1 transition-colors">
            <Printer size={24} />
            <span>Print Bill</span>
          </button>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={handleShareWhatsApp} className="py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128C7E] flex flex-col items-center gap-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp / Share</span>
          </a>
          <button onClick={async () => {
             const email = prompt("Enter customer email address:");
             if(email) {
               try {
                 await api.post(\`/bills/\${lastBill.uuid}/send-receipt\`, { email });
                 alert('Receipt sent via Email!');
               } catch(e) { alert('Failed to send receipt.'); }
             }
          }} className="py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 flex flex-col items-center gap-1 transition-colors">
            <Mail size={24} />
            <span>Email Receipt</span>
          </button>
          <button onClick={async () => {
             try {
               const res = await api.post(\`/bills/\${lastBill.uuid}/create-payment-link\`);
               if(res.url) {
                 window.open(res.url, '_blank');
               }
             } catch(e) { alert('Failed to create payment link.'); }
          }} className="py-3 bg-[#635BFF] text-white font-bold rounded-xl hover:bg-[#544ee6] flex flex-col items-center gap-1 transition-colors">
            <CreditCard size={24} />
            <span>Pay via Stripe</span>
          </button>
`;

code = code.replace(/<button onClick=\{handlePrint\}.*?<\/a>/s, receiptModalButtons);

if (!code.includes("import { Award, Mail, CreditCard,")) {
   code = code.replace(/import \{ /, "import { Award, Mail, CreditCard, ");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Checkout logic successfully");
