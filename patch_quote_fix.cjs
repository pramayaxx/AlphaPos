const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/setIsProcessing\(true\);/, "");
code = code.replace(/setIsProcessing\(false\);/, "");
code = code.replace(/grandTotal: total/, "grandTotal: grandTotal");
code = code.replace(/disabled=\{cart\.length === 0 \|\| isProcessing\}/, "disabled={cart.length === 0}");
code = code.replace(/const quoteData = \{[\s\S]*?grandTotal: grandTotal\n      \};/m, `const quoteData = {
        uuid: 'QT-' + Date.now().toString().slice(-6),
        customerId: selectedCustomerId,
        items: cart,
        subtotal: subtotal,
        discount: discountAmount,
        discountType: discountType,
        discountValue: discountValue,
        taxAmount: taxAmount,
        taxRate: settings?.taxRate || 0,
        grandTotal: grandTotal
      };`);

fs.writeFileSync('src/App.tsx', code);
