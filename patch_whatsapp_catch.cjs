const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /\} catch \(err: any\) \{\n\s*console\.error\('Checkout save error:', err\);\n\s*alert\(`Error saving sale: \$\{err\.message \|\| 'Unknown error'\}`\);\n\s*\}/,
  `} catch (err: any) {
      console.error('Checkout save error:', err);
      alert(\`Error saving sale: \${err.message || 'Unknown error'}\`);
      if (waWindow) waWindow.close();
    }`
);

fs.writeFileSync('src/App.tsx', code);
