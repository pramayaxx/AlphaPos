const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const usbPrintLogic = `
  const testUsbPrinter = async () => {
    try {
      // ESC/POS Commands: Initialize, Cash Drawer, text, cut
      const ESC = "\\x1B";
      const GS = "\\x1D";
      const init = ESC + "@";
      const openDrawer = ESC + "p" + "\\x00" + "\\x32" + "\\xFA"; // pulse pin 2
      const cutPaper = GS + "V" + "\\x41" + "\\x00";

      let receiptText = init + "    --- ALPHA POS ---\\n\\n";
      cart.forEach(item => {
        receiptText += \`\${item.product.name} x\${item.quantity}   \$\${(item.price * item.quantity).toFixed(2)}\\n\`;
      });
      receiptText += \`\\nTOTAL: \$\${grandTotal.toFixed(2)}\\n\\n\`;
      receiptText += cutPaper + openDrawer;

      alert("Simulated WebUSB ESC/POS command sent to printer:\\n\\n" + receiptText);
      
      // Real implementation would look like:
      // const device = await (navigator as any).usb.requestDevice({ filters: [{ vendorId: 0x04b8 }] }); // e.g., Epson
      // await device.open();
      // await device.selectConfiguration(1);
      // await device.claimInterface(0);
      // const encoder = new TextEncoder();
      // await device.transferOut(1, encoder.encode(receiptText));
      // await device.close();

    } catch (err: any) {
      alert("Print failed: " + err.message);
    }
  };

  const verifyManagerPin = async (actionDesc: string) => {
    const pin = prompt(\`Manager PIN required for: \${actionDesc}\`);
    if (!pin) return false;
    try {
      const res = await window.api.post('/verify-pin', { pin });
      if (res.success) {
        alert(\`Manager \${res.manager.full_name || 'Approved'}\`);
        return true;
      }
      alert('Invalid Manager PIN');
      return false;
    } catch(e) { return false; }
  };
`;

if (!code.includes('testUsbPrinter')) {
  code = code.replace(/const Checkout = \([\s\S]*?\{[\s\S]*?const \[cart, setCart\] = useState/, match => {
    return match.replace(/const \[cart, setCart\] = useState/, usbPrintLogic + '\n  const [cart, setCart] = useState');
  });

  // Replace default window.print with USB print + traditional print fallback
  code = code.replace(/<button onClick=\{handleCompleteSale\}/, `
        <button onClick={async () => {
             const action = prompt('Type 1 for Standard Print, 2 for Direct ESC/POS Print, 3 for B2B Invoice');
             if (action === '3') {
                if(!selectedCustomer) return alert('Select customer for B2B invoice');
                try {
                  await window.api.post('/invoices', {
                    customer_id: selectedCustomer.id,
                    amount: grandTotal,
                    due_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
                  });
                  alert('B2B Invoice generated successfully.');
                  onSaleComplete && onSaleComplete();
                } catch(e) { alert('Invoice failed'); }
             } else if (action === '2') {
                await testUsbPrinter();
                handleCompleteSale();
             } else {
                window.print();
                handleCompleteSale();
             }
        }}
  `);

  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched Checkout for USB printing, Drawer kick, Invoices, and PIN function.");
}
