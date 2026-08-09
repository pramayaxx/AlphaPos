const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<button onClick=\{\(\) => window\.print\(\)\} className="py-3 bg-slate-100/;
const rep = `const handlePrint = async () => {
      window.print();
      try {
        await api.patch(\`/bills/\${lastBill.uuid}\`, { isPrinted: true });
      } catch (err) {
        console.error('Failed to mark as printed', err);
      }
    };

    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
             Sale Successful!
          </h2>
        </div>

        <ReceiptView bill={lastBill} settings={settings} />

        <div className="grid grid-cols-2 gap-4">
          <button onClick={handlePrint} className="py-3 bg-slate-100`;

code = code.replace(
  /return \(\s*<div className="max-w-md mx-auto space-y-6">\s*<div className="flex items-center justify-between">\s*<h2 className="text-xl font-bold text-emerald-600 flex items-center gap-2">\s*Sale Successful!\s*<\/h2>\s*<\/div>\s*<ReceiptView bill=\{lastBill\} settings=\{settings\} \/>\s*<div className="grid grid-cols-2 gap-4">\s*<button onClick=\{\(\) => window\.print\(\)\} className="py-3 bg-slate-100/m,
  rep
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched print status");
