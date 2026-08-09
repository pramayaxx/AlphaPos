const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const searchRegex = /const handleConfirm = async \(printNow: boolean\) => \{[\s\S]*?const savedBillData = \{/m;
if (!searchRegex.test(code)) {
    console.log("Could not find start of handleConfirm");
} else {
    // We will inject the window.open logic at the beginning of handleConfirm
    code = code.replace(/const handleConfirm = async \(printNow: boolean\) => \{\s*if \(cart\.length === 0\) return;\s*try \{/, 
`const handleConfirm = async (printNow: boolean) => {
    if (cart.length === 0) return;

    let waWindow: Window | null = null;
    if (selectedCustomerId) {
      const customer = customers.find(c => String(c.id) === String(selectedCustomerId));
      if (customer && customer.phone) {
        waWindow = window.open('', '_blank');
      }
    }

    try {`);

    code = code.replace(/window\.open\(waUrl, '_blank'\);/g, 
`if (waWindow) {
             waWindow.location.href = waUrl;
           } else {
             window.open(waUrl, '_blank');
           }`);
    
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched window.open successfully!");
}
