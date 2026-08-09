const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "const PendingPrints = ({ bills, settings, onBack }: { bills: Bill[], settings: ShopSettings | null, onBack: () => void }) => {",
  "const PendingPrints = ({ bills, settings, onBack, onSaleComplete }: { bills: Bill[], settings: ShopSettings | null, onBack: () => void, onSaleComplete?: () => void }) => {"
);

code = code.replace(
  /await api\.patch\(\`\/bills\/\$\{bill\.uuid\}\`, \{ isPrinted: true \}\);\s*alert\(\`Receipt for \$\{bill\.uuid\.slice\(0, 8\)\} printed successfully!\`\);/,
  "await api.patch(`/bills/${bill.uuid}`, { isPrinted: true });\n      alert(`Receipt for ${bill.uuid.slice(0, 8)} printed successfully!`);\n      if (onSaleComplete) onSaleComplete();"
);

fs.writeFileSync('src/App.tsx', code);
