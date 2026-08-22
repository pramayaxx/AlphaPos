const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/<p className="text-xs text-blue-600\/70 dark:text-blue-400\/70">1 point = \{formatCurrency\(0\.01\)\}<\/p>/, 
  "<p className=\"text-xs text-blue-600/70 dark:text-blue-400/70\">1 point = {formatCurrency(settings?.valuePerPoint || 0.01)}</p>");
code = code.replace(/<span>-\{\(Number\(\(bill as any\)\.pointsRedeemed \* 0\.01\)\)\.toFixed\(2\)\}<\/span>/, 
  "<span>-{Number((bill as any).pointsRedeemed * (settings?.valuePerPoint || 0.01)).toFixed(2)}</span>");
fs.writeFileSync('src/App.tsx', code);
