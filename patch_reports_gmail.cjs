const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { googleSignIn, sendGmailReport } from './gmail';")) {
  code = code.replace(
    "import { cn, formatCurrency } from './lib/utils';",
    "import { cn, formatCurrency } from './lib/utils';\nimport { googleSignIn, sendGmailReport } from './gmail';"
  );
}

// Inject into ReportsScreen
let newReportsFn = `  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const handleSendGmailReport = async () => {
    setIsSendingEmail(true);
    try {
      const authResult = await googleSignIn();
      if (!authResult) throw new Error("Google Sign In failed");
      
      const reportContent = \`
        <h1>POS Report - \${dateRange}</h1>
        <p>Total Sales: \${formatCurrency(totalSales)}</p>
        <p>Total Orders: \${totalOrders}</p>
        <p>Average Order Value: \${formatCurrency(avgOrder)}</p>
        <h2>Sales by Category</h2>
        <ul>
          \${salesByCategory.map(c => \`<li>\${c.name}: \${formatCurrency(c.value)}</li>\`).join('')}
        </ul>
      \`;

      await sendGmailReport(authResult.accessToken, reportContent);
      alert("Report sent to your Gmail successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send report. See console.");
    } finally {
      setIsSendingEmail(false);
    }
  };`;

if (!code.includes("handleSendGmailReport")) {
  code = code.replace(
    "  const handleExportCsv = () => {",
    newReportsFn + "\n\n  const handleExportCsv = () => {"
  );
}

let newButton = `
          {currentUser?.role === 'admin' && (
            <button 
              onClick={handleSendGmailReport}
              disabled={isSendingEmail}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 border border-blue-700 hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSendingEmail ? 'Sending...' : 'Send via Gmail'}
            </button>
          )}
          <button`;

code = code.replace(
  "          <button \n             onClick={handleExportCsv}",
  newButton + " \n             onClick={handleExportCsv}"
);

fs.writeFileSync('src/App.tsx', code);
