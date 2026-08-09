const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const original = `
      if (selectedCustomerId) {
        const customer = customers.find(c => String(c.id) === String(selectedCustomerId));
        if (customer && customer.phone) {
           const billUrl = \`\${window.location.origin}/api/public/bills/\${savedBillData.uuid}/pdf\`;
           let phoneStr = customer.phone.replace(/[^0-9]/g, '');
           if (phoneStr.startsWith('0') && phoneStr.length === 10) {
             phoneStr = '94' + phoneStr.substring(1);
           }
           const text = \`Thank you for your purchase! Here is your bill as a PDF: \${billUrl}\`;
           const waUrl = \`https://wa.me/\${phoneStr}?text=\${encodeURIComponent(text)}\`;
           window.open(waUrl, '_blank');
        }
      }
`;

const patched = `
      if (selectedCustomerId) {
        const customer = customers.find(c => String(c.id) === String(selectedCustomerId));
        if (customer && customer.phone) {
           const billUrl = \`\${window.location.origin}/api/public/bills/\${savedBillData.uuid}/pdf\`;
           let phoneStr = customer.phone.replace(/[^0-9]/g, '');
           if (phoneStr.startsWith('0') && phoneStr.length === 10) {
             phoneStr = '94' + phoneStr.substring(1);
           }
           
           try {
             const res = await fetch(billUrl);
             const blob = await res.blob();
             const file = new File([blob], \`bill-\${savedBillData.uuid}.pdf\`, { type: 'application/pdf' });
             
             if (navigator.canShare && navigator.canShare({ files: [file] })) {
               await navigator.share({
                 files: [file],
                 title: 'Your Bill',
                 text: 'Thank you for your purchase. Please find your bill attached.'
               });
             } else {
               // Fallback to Web link
               const text = \`Thank you for your purchase! Here is your bill: \${billUrl}\`;
               const waUrl = \`https://wa.me/\${phoneStr}?text=\${encodeURIComponent(text)}\`;
               window.open(waUrl, '_blank');
             }
           } catch (e) {
             console.error("Error sharing PDF", e);
             const text = \`Thank you for your purchase! Here is your bill: \${billUrl}\`;
             const waUrl = \`https://wa.me/\${phoneStr}?text=\${encodeURIComponent(text)}\`;
             window.open(waUrl, '_blank');
           }
        }
      }
`;

code = code.replace(original.trim(), patched.trim());
fs.writeFileSync('src/App.tsx', code);
