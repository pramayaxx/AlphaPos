const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const handleWhatsApp = \(\) => \{[\s\S]*?window\.open\(waUrl, '_blank'\);\s*\};/m;

const replacement = `let phoneStr = '';
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
    const waUrl = \`https://wa.me/\${phoneStr}?text=\${encodeURIComponent(text)}\`;`;

code = code.replace(regex, replacement);

const buttonRegex = /<button onClick=\{handleWhatsApp\}([\s\S]*?)<\/button>/m;
const buttonReplacement = `<a href={waUrl} target="_blank" rel="noopener noreferrer"$1</a>`;

code = code.replace(buttonRegex, buttonReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched WhatsApp");
