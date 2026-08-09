const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Rewrite handleConfirm to not auto-print or auto-whatsapp
const confirmRegex = /const handleConfirm = async \(printNow: boolean\) => \{[\s\S]*?\} catch \(err: any\) \{[\s\S]*?\}\s*\};/m;
const confirmReplacement = `const handleConfirm = async () => {
    if (cart.length === 0) return;

    try {
      const savedBillData = {
        uuid: crypto.randomUUID(),
        dateTime: new Date(),
        items: [...cart],
        subtotal,
        discount: discountAmount,
        discountType,
        discountValue,
        taxAmount,
        taxRate: settings.taxRate || 0,
        grandTotal,
        isPrinted: false, // User can print in the next step
        createdBy: currentUser.id,
        customerId: selectedCustomerId || undefined,
        paymentMethod,
        status: 'paid'
      };

      const savedBill = await api.post('/bills', savedBillData);
      setLastBill(savedBill);
      setCart([]);
      setShowReceipt(true);
    } catch (err: any) {
      console.error('Checkout save error:', err);
      alert(\`Error saving sale: \${err.message || 'Unknown error'}\`);
    }
  };`;

code = code.replace(confirmRegex, confirmReplacement);

// 2. Rewrite Receipt view to have Print and WhatsApp options
const receiptRegex = /if \(showReceipt && lastBill && settings\) \{[\s\S]*?return \([\s\S]*?<div className="max-w-md mx-auto space-y-6">[\s\S]*?Done\s*<\/button>\s*<\/div>\s*\);\s*\}/;

const receiptReplacement = `if (showReceipt && lastBill && settings) {
    const handleWhatsApp = () => {
      let phoneStr = '';
      if (selectedCustomerId) {
        const customer = customers.find(c => String(c.id) === String(selectedCustomerId));
        if (customer && customer.phone) {
          phoneStr = customer.phone.replace(/[^0-9]/g, '');
          if (phoneStr.startsWith('0') && phoneStr.length === 10) {
            phoneStr = '94' + phoneStr.substring(1);
          }
        }
      }
      
      const billUrl = \`\${window.location.origin}/api/public/bills/\${lastBill.uuid}/pdf\`;
      const text = \`Greetings from \${settings.name || 'Our Shop'}\\nWe are pleased to have you as a valuable customer. Please find the details of your transaction.\\n\\nSale Invoice : \${lastBill.uuid}\\nInvoice Amount: \${formatCurrency(lastBill.grandTotal)}\\nBalance: 0.00\\n\\nThanks for doing business with us.\\nRegards,\\n\${settings.name || 'Our Shop'}\\n\\nInvoice Link:\\n\${billUrl}\`;
      const waUrl = \`https://wa.me/\${phoneStr}?text=\${encodeURIComponent(text)}\`;
      window.open(waUrl, '_blank');
    };

    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
             Sale Successful!
          </h2>
        </div>

        <ReceiptView bill={lastBill} settings={settings} />

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => window.print()} className="py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 flex flex-col items-center gap-1 transition-colors">
            <Printer size={24} />
            <span>Print Bill</span>
          </button>
          <button onClick={handleWhatsApp} className="py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128C7E] flex flex-col items-center gap-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp</span>
          </button>
          <button 
            onClick={onBack}
            className="col-span-2 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            New Sale
          </button>
        </div>
      </div>
    );
  }`;
code = code.replace(receiptRegex, receiptReplacement);

// 3. Update the Confirm buttons below in the checkout form
const buttonsRegex = /<button \s*disabled=\{cart\.length === 0\}\s*onClick=\{\(\) => handleConfirm\(false\)\}[\s\S]*?Confirm & Print\s*<\/button>/;
const buttonsReplacement = `<button 
              disabled={cart.length === 0}
              onClick={handleConfirm}
              className="col-span-2 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Confirm Sale
            </button>`;
code = code.replace(buttonsRegex, buttonsReplacement);

// Fix keyboard shortcut ctrl+enter
code = code.replace(/handleConfirm\(true\);/, 'handleConfirm();');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched checkout logic successfully!");
