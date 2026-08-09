const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const scaleButton = `
  const handleReadScale = async () => {
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      const reader = port.readable.getReader();
      const { value, done } = await reader.read();
      if (value) {
        const decoder = new TextDecoder();
        const weight = decoder.decode(value);
        alert('Weight read from scale: ' + weight + ' kg');
        // You can attach this to the active cart item here
      }
      reader.releaseLock();
      await port.close();
    } catch (err) {
      alert("Error reading scale: " + err);
    }
  };
`;

if (!code.includes('handleReadScale')) {
  // insert inside Checkout
  code = code.replace(/const Checkout = \([\s\S]*?\{[\s\S]*?const \[cart, setCart\] = useState/, match => {
    return match.replace(/const \[cart, setCart\] = useState/, scaleButton + '\n  const [cart, setCart] = useState');
  });
  
  // insert button near the top right of checkout
  code = code.replace(/<button\s*onClick=\{onBack\}/, `
        <button onClick={handleReadScale} className="mr-4 text-slate-500 hover:text-blue-500 flex items-center gap-2 font-bold text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl transition-colors">
          <Scale size={18} /> Read Scale
        </button>
        <button onClick={onBack}
  `);
  
  if(!code.includes('Scale')) {
     code = code.replace(/import \{ /, "import { Scale, ");
  }

  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched checkout for scale.");
}
