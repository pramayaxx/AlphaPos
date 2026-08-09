const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const ReceiptView = \(\{ bill, settings \} : \{ bill: Bill, settings: ShopSettings \}\) => \{[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\};/m;

const replacement = `const ReceiptView = ({ bill, settings }: { bill: Bill, settings: ShopSettings }) => {
  const widthPx = settings.receiptWidth * 3.78; // Convert mm to approximate px (96dpi)
  
  return (
    <div 
      id="receipt" 
      className="p-10 bg-white text-black border border-slate-200 rounded-2xl shadow-sm font-mono leading-relaxed mx-auto" 
      style={{ 
        fontSize: \`\${settings.receiptFontSize}px\`,
        width: settings.receiptPaperSize === 'custom' ? \`\${widthPx}px\` : (settings.receiptPaperSize === '58mm' ? '219px' : (settings.receiptPaperSize === '80mm' ? '302px' : '100%')),
        maxWidth: '100%'
      }}
    >
      <div className="text-center space-y-3 mb-8">
        {settings.logoUrl && (
          <img 
            src={settings.logoUrl} 
            alt="Store Logo" 
            className="h-20 mx-auto mb-4 object-contain grayscale"
            referrerPolicy="no-referrer"
          />
        )}
        {settings.showStoreName && <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900">{settings.name}</h1>}
        {settings.showStoreDetails && (
          <div className="space-y-1 text-slate-500 font-medium">
            {settings.showAddress && <p className="max-w-[200px] mx-auto">{settings.address}</p>}
            {settings.showPhone && <p className="text-slate-900">Tel: {settings.phone}</p>}
          </div>
        )}

        <div className="border-t-2 border-double border-slate-200 my-6"></div>

        {settings.receiptHeader && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{settings.receiptHeader}</p>}

        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
          {settings.showInvoiceNumber && <span>INV: #{bill.uuid.slice(0, 8).toUpperCase()}</span>}
          {settings.showDateTime && <span>{format(bill.dateTime, 'dd MMM yyyy HH:mm')}</span>}
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex justify-between font-black text-slate-900 border-b-2 border-slate-900 pb-2 uppercase tracking-tighter text-[0.9em]">
          <span>Description</span>
          <span className="w-20 text-right">Total</span>
        </div>
        {bill.items.map((item, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex justify-between font-bold text-slate-800">
              <span className="flex-1">{item.name}</span>
              <span className="w-20 text-right">{(item.quantity * item.price).toFixed(2)}</span>
            </div>
            <div className="text-[0.8em] text-slate-400 font-medium">
              {item.quantity} x {item.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-slate-200 pt-6">
        <div className="flex justify-between text-slate-500 font-bold">
          <span>Subtotal</span>
          <span>{bill.subtotal.toFixed(2)}</span>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between text-rose-600 font-bold">
            <span>Discount</span>
            <span>-{bill.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-slate-900 mt-4 pt-4 border-t-2 border-double border-slate-200" style={{ fontSize: '1.4em' }}>
          <span className="tracking-tighter">TOTAL</span>
          <span>{formatCurrency(bill.grandTotal)}</span>
        </div>
      </div>

      <div className="text-center mt-12 space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{settings.receiptFooter}</p>
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Alpha Mobile POS • v2.0</p>
        </div>
      </div>
    </div>
  );
};`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched ReceiptView");
