const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const cfdScreen = `
const CFDScreen = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handleStorage = (e: any) => {
      if (e.key === 'pos_current_cart') {
        const parsed = JSON.parse(e.newValue || '[]');
        setCart(parsed);
        const t = parsed.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        setTotal(t);
      }
    };
    window.addEventListener('storage', handleStorage);
    // initial load
    const initial = JSON.parse(localStorage.getItem('pos_current_cart') || '[]');
    setCart(initial);
    setTotal(initial.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0));
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-white p-8">
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black tracking-tighter text-blue-500">ALPHA POS</h1>
        <h2 className="text-2xl font-bold text-slate-400">Customer Display</h2>
      </div>
      
      <div className="flex-1 flex gap-10 overflow-hidden">
        <div className="flex-1 bg-slate-800 rounded-3xl p-6 overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-4 text-xl">Item</th>
                <th className="pb-4 text-xl text-center">Qty</th>
                <th className="pb-4 text-xl text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item: any, i) => (
                <tr key={i} className="border-b border-slate-700/50">
                  <td className="py-6 text-2xl font-bold">{item.product.name}</td>
                  <td className="py-6 text-2xl font-bold text-center">x{item.quantity}</td>
                  <td className="py-6 text-2xl font-black text-blue-400 text-right">\\$\\{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-500 text-2xl font-bold">Welcome! Next customer please.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="w-1/3 bg-blue-600 rounded-3xl p-10 flex flex-col justify-center items-center text-center shadow-2xl shadow-blue-900/50">
          <div className="text-blue-200 font-bold text-2xl mb-4 uppercase tracking-widest">Total Amount</div>
          <div className="text-7xl font-black">\\$\\{total.toFixed(2)}</div>
          
          <div className="mt-16 text-blue-200 text-xl font-medium">
            Scan QR to pay / Earn points
          </div>
          <div className="w-48 h-48 bg-white rounded-2xl mt-6 p-2">
             <div className="w-full h-full border-4 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-bold">QR CODE</div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

if (!code.includes('CFDScreen')) {
  // insert CFDScreen
  code = code.replace(/const Dashboard = /, cfdScreen.replace(/\\\\\\$/g, '$').replace(/\\\\\\{/g, '{') + "\nconst Dashboard = ");
  
  // modify App to check for hash
  const hashCheck = `
  if (window.location.hash === '#cfd') {
    return <CFDScreen />;
  }
  `;
  code = code.replace(/return \(/, hashCheck + "\n  return (");
  
  // modify Checkout to sync cart to localStorage
  code = code.replace(/const \[cart, setCart\] = useState<CartItem\[\]>\(\[\]\);/, 
    "const [cart, setCart] = useState<CartItem[]>([]);\n  useEffect(() => { localStorage.setItem('pos_current_cart', JSON.stringify(cart)); }, [cart]);"
  );
  
  // add a button in checkout to open CFD
  code = code.replace(/<button onClick=\{handleReadScale\}/, `
        <button onClick={() => window.open(window.location.origin + '/#cfd', '_blank', 'width=800,height=600')} className="mr-4 text-emerald-600 hover:text-emerald-700 flex items-center gap-2 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl transition-colors">
          <Monitor size={18} /> Open CFD
        </button>
        <button onClick={handleReadScale}
  `);

  if(!code.includes('Monitor')) {
     code = code.replace(/import \{ /, "import { Monitor, ");
  }

  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched CFD.");
}
