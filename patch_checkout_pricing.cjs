const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// For Wholesale pricing:
// In addToCart, we check if customer has a wholesale tag (maybe if role or if customer.is_wholesale, let's just use wholesale_price if it's set and > 0, actually we can let user toggle wholesale mode)

const toggleWholesale = `
  const [isWholesale, setIsWholesale] = useState(false);
`;

if (!code.includes('isWholesale')) {
  code = code.replace(/const \[cart, setCart\] = useState<CartItem\[\]>\(\[\]\);/, toggleWholesale + "\n  const [cart, setCart] = useState<CartItem[]>([]);");
  
  // Update addToCart price calculation
  code = code.replace(/const newItem = \{ product: p, quantity: 1, price: p\.price \};/, `
      const priceToUse = isWholesale && p.wholesale_price ? p.wholesale_price : p.price;
      const newItem = { product: p, quantity: 1, price: priceToUse };
  `);
  
  // Add a toggle for wholesale
  code = code.replace(/<div className="flex-1 overflow-auto p-4 md:p-8 flex gap-6">/, `
      <div className="px-8 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex gap-4">
         <label className="flex items-center gap-2 font-bold text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
           <input type="checkbox" checked={isWholesale} onChange={(e) => setIsWholesale(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
           Enable Wholesale Pricing
         </label>
      </div>
      <div className="flex-1 overflow-auto p-4 md:p-8 flex gap-6">
  `);
}

// For Store Credit:
// Under Payment Method, if selectedCustomer and store_credit > 0, show a button to use store credit.
const storeCreditHtml = `
            {selectedCustomer && selectedCustomer.store_credit && selectedCustomer.store_credit > 0 ? (
              <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl flex justify-between items-center border border-indigo-100 dark:border-indigo-800/50">
                <span className="font-bold text-sm">Store Credit Available: {formatCurrency(selectedCustomer.store_credit)}</span>
                <button 
                  onClick={() => {
                    const useAmount = Math.min(grandTotal, selectedCustomer.store_credit || 0);
                    setAmountPaid(useAmount);
                    alert('Store credit applied: ' + formatCurrency(useAmount));
                  }}
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                >
                  Use Credit
                </button>
              </div>
            ) : null}
`;

if (!code.includes('Store Credit Available:')) {
  code = code.replace(/<div className="grid grid-cols-2 gap-3 mb-6">/, storeCreditHtml + "\n            <div className=\"grid grid-cols-2 gap-3 mb-6\">");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched checkout pricing and credit.");
