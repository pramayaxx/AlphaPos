const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const ReceiptView = \(\{ bill, settings \}: \{ bill: Bill, settings: ShopSettings \}\) => \{[\s\S]*?const AuthScreen =/m;

const replacement = `const ReceiptView = ({ bill, settings }: { bill: Bill, settings: ShopSettings }) => {
  const widthPx = settings.receiptWidth * 3.78; // Convert mm to approximate px (96dpi)
  
  return (
    <div 
      id="receipt" 
      className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm font-mono leading-relaxed mx-auto text-slate-900" 
      style={{ 
        fontSize: \`\${settings.receiptFontSize}px\`,
        width: settings.receiptPaperSize === 'custom' ? \`\${widthPx}px\` : (settings.receiptPaperSize === '58mm' ? '219px' : (settings.receiptPaperSize === '80mm' ? '302px' : '100%')),
        maxWidth: '100%'
      }}
    >
      <div className="text-center space-y-1 mb-6">
        {settings.logoUrl && (
          <img 
            src={settings.logoUrl} 
            alt="Store Logo" 
            className="h-20 mx-auto mb-4 object-contain grayscale"
            referrerPolicy="no-referrer"
          />
        )}
        {settings.showStoreName && <h1 className="text-2xl font-bold tracking-widest uppercase">{settings.name}</h1>}
        {settings.showStoreDetails && (
          <div className="space-y-1 mt-2 text-sm">
            {settings.showAddress && <p className="max-w-[250px] mx-auto">{settings.address}</p>}
            {settings.showPhone && <p>Tel: {settings.phone}</p>}
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-slate-300 my-4"></div>

      <div className="text-center space-y-2 mb-4">
        {settings.receiptHeader && <p className="text-xs tracking-widest uppercase">{settings.receiptHeader}</p>}
        <div className="text-[10px] uppercase tracking-wider flex justify-center items-center gap-4">
          {settings.showInvoiceNumber && <span>INV: #{bill.uuid.slice(0, 8).toUpperCase()}</span>}
          {settings.showDateTime && <span>{format(bill.dateTime, 'dd MMM yyyy HH:mm')}</span>}
        </div>
      </div>

      <div className="border-t border-dashed border-slate-300 my-4"></div>

      <div className="space-y-4 mb-4">
        <div className="flex justify-between font-bold border-b border-dashed border-slate-300 pb-2 uppercase tracking-wider text-xs">
          <span>Description</span>
          <span className="w-20 text-right">Total</span>
        </div>
        {bill.items.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between font-bold text-sm">
              <span className="flex-1 pr-2">{item.name}</span>
              <span className="w-24 text-right">{(item.quantity * item.price).toFixed(2)}</span>
            </div>
            <div className="text-xs text-slate-500">
              {item.quantity} x {Number(item.price).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-slate-300 my-4"></div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{Number(bill.subtotal).toFixed(2)}</span>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between text-rose-600">
            <span>Discount</span>
            <span>-{Number(bill.discount).toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-slate-300 my-4"></div>

      <div className="flex justify-between font-bold text-lg">
        <span className="uppercase tracking-widest">Total</span>
        <span>{formatCurrency(bill.grandTotal)}</span>
      </div>

      <div className="border-t border-dashed border-slate-300 my-4"></div>

      <div className="text-center mt-6 space-y-4">
        <p className="text-xs tracking-widest uppercase max-w-[200px] mx-auto leading-relaxed">{settings.receiptFooter}</p>
        <div className="pt-2 border-t border-dashed border-slate-300">
          <p className="text-[9px] text-slate-400 uppercase tracking-widest">Alpha Mobile POS • v2.0</p>
        </div>
      </div>
    </div>
  );
};

const AuthScreen =`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched ReceiptView");
