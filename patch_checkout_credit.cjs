const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace payment method mapped buttons
code = code.replace(/\(method \=\> \(\s*<button\s*key=\{method\}\s*onClick=\{\(\) \=\> setPaymentMethod\(method\)\}/, `(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method as any)}`);
code = code.replace(/\(\['cash', 'card', 'mobile'\] as const\)/, "(['cash', 'card', 'mobile', 'credit'] as const)");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched payment methods");
