const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const voidLogic = `
  const handleRemoveItem = async (index: number) => {
    const item = cart[index];
    if (item.price * item.quantity > 50) {
       const approved = await verifyManagerPin('Void High Value Item');
       if (!approved) return;
    }
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };
`;

if (!code.includes('handleRemoveItem')) {
  code = code.replace(/const removeFromCart = \(index: number\) => \{[\s\S]*?setCart\(newCart\);\s*\};/, voidLogic);
  
  // replace removeFromCart with handleRemoveItem in the UI
  code = code.replace(/onClick=\{\(\) => removeFromCart\(i\)\}/g, "onClick={() => handleRemoveItem(i)}");
  
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched Checkout for void PIN protection.");
}
