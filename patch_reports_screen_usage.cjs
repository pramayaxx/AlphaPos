const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  "const ReportsScreen = ({ bills, products }: { bills: Bill[], products: Product[] }) => {",
  "const ReportsScreen = ({ bills, products, currentUser }: { bills: Bill[], products: Product[], currentUser: User | null }) => {"
);
code = code.replace(
  "<ReportsScreen bills={bills} products={products} />",
  "<ReportsScreen bills={bills} products={products} currentUser={currentUser} />"
);
fs.writeFileSync('src/App.tsx', code);
