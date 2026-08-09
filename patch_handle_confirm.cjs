const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const savedBill = await api\.post\('\/bills', savedBillData\);\s*setLastBill\(\{\.\.\.savedBill, dateTime: new Date\(savedBill\.dateTime\)\}\);\s*setCart\(\[\]\);\s*setShowReceipt\(true\);/;

const replacement = `const savedBill = await api.post('/bills', savedBillData);
      setLastBill({...savedBill, dateTime: new Date(savedBill.dateTime)});
      
      const customer = customers.find(c => String(c.id) === String(selectedCustomerId));
      if (customer && customer.phone) {
        const phoneStr = customer.phone.replace(/\\D/g, '');
        if (phoneStr) {
          const billUrl = \`\${window.location.origin}/public/bill/\${savedBill.uuid}\`;
          const text = \`Greetings from \${settings.name || 'Our Shop'}\\nWe are pleased to have you as a valuable customer. Please find the details of your transaction.\\n\\nSale Invoice : \${savedBill.uuid}\\nInvoice Amount: \${formatCurrency(savedBill.grandTotal)}\\nBalance: 0.00\\n\\nThanks for doing business with us.\\nRegards,\\n\${settings.name || 'Our Shop'}\\n\\nInvoice Link:\\n\${billUrl}\`;
          const waUrl = \`https://wa.me/\${phoneStr}?text=\${encodeURIComponent(text)}\`;
          setTimeout(() => {
            window.open(waUrl, '_blank');
          }, 300);
        }
      }

      setCart([]);
      setShowReceipt(true);`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched handleConfirm");
