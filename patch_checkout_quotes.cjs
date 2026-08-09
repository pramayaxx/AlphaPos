const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const quoteFunc = `
  const handleSaveQuote = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const quoteData = {
        uuid: 'QT-' + Date.now().toString().slice(-6),
        customerId: selectedCustomerId,
        items: cart,
        subtotal: subtotal,
        discount: discountAmount,
        discountType: discountType,
        discountValue: discountValue,
        taxAmount: taxAmount,
        taxRate: settings?.taxRate || 0,
        grandTotal: total
      };
      await api.post('/quotes', quoteData);
      setCart([]);
      setDiscountValue(0);
      setSelectedCustomerId('');
      alert("Quote saved successfully!");
    } catch(err: any) {
      alert("Failed to save quote: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };
`;

code = code.replace(/const handleConfirm = async \(\) => \{/, quoteFunc + "\n\n  const handleConfirm = async () => {");

const quoteBtn = `
                <button 
                  onClick={handleSaveQuote}
                  disabled={cart.length === 0 || isProcessing}
                  className="w-full py-4 mt-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-black rounded-2xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all shadow-sm"
                >
                  Save as Quote
                </button>
`;

code = code.replace(/<button \n                  onClick=\{handleConfirm\}/, quoteBtn + "\n                <button \n                  onClick={handleConfirm}");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Checkout for Quotes");
