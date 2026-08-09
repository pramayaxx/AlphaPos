const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const PublicBillScreen = \(\) => \{[\s\S]*?return \([\s\S]*?  \);\n\};\n/m;

const replacement = `const PublicBillScreen = () => {
  const [bill, setBill] = useState<Bill | null>(null);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBill = async () => {
      const match = window.location.pathname.match(/\\/public\\/bill\\/([^\\/]+)/);
      if (match && match[1]) {
        try {
          const res = await fetch(\`/api/public/bills/\${match[1]}\`);
          if (!res.ok) throw new Error('Bill not found');
          const data = await res.json();
          setBill({ ...data.bill, dateTime: new Date(data.bill.dateTime) });
          setSettings(data.settings);
        } catch (err) {
          setError('Failed to load bill');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBill();
  }, []);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('receipt');
    if (!element || !bill) return;
    
    // Scale up for better PDF quality
    const opt = {
      margin: 0,
      filename: \`bill-\${bill.uuid}.pdf\`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: [settings?.receiptWidth === 80 ? 80 : 58, 200], orientation: 'portrait' }
    };
    
    try {
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error(e);
      alert("Could not generate PDF");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error || !bill || !settings) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold">{error || 'Bill not found'}</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
             <CheckCircle2 size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">E-Receipt</h2>
          <p className="text-blue-100 mt-1 opacity-90">{settings.name || 'Store'} • {formatCurrency(bill.grandTotal)}</p>
        </div>

        {/* Receipt Container */}
        <div className="p-6 bg-slate-100 dark:bg-slate-900/50 flex justify-center overflow-x-auto">
           <ReceiptView bill={bill} settings={settings} />
        </div>

        {/* Actions */}
        <div className="p-6 bg-white dark:bg-slate-800 space-y-3">
          <button 
            onClick={() => window.print()} 
            className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center gap-2 transition-colors"
          >
            <Printer size={20} />
            Print Receipt
          </button>
          
          <button 
            onClick={handleDownloadPDF} 
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-600/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
          </button>
        </div>

      </div>
    </div>
  );
};
`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched PublicBillScreen");
