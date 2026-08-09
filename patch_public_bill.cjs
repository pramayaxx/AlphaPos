const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const publicBillComponent = `
const PublicBillScreen = () => {
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error || !bill || !settings) return <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold">{error || 'Bill not found'}</div>;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-8 flex items-start justify-center overflow-auto py-12">
      <div className="w-full max-w-sm">
        <ReceiptView bill={bill} settings={settings} />
      </div>
    </div>
  );
};
`;

const regex = /export default function App\(\) \{/;
code = code.replace(regex, publicBillComponent + '\nexport default function App() {\n  if (window.location.pathname.startsWith(\'/public/bill/\')) {\n    return <PublicBillScreen />;\n  }\n');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with PublicBillScreen");
