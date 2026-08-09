const fs = require('fs');
let code = fs.readFileSync('src/PurchaseOrdersScreen.tsx', 'utf-8');

code = code.replace(/const PurchaseOrdersScreen = \(\{\s*suppliers,\s*products\s*\}\s*:\s*\{\s*suppliers:\s*Supplier\[\],\s*products:\s*Product\[\]\s*\}\) => \{/, "const PurchaseOrdersScreen = ({ products }: { products: Product[] }) => {\n  const [suppliers, setSuppliers] = useState<Supplier[]>([]);");

code = code.replace(/fetchPos\(\);/, "fetchPos();\n      const sups = await api.get('/suppliers');\n      setSuppliers(sups);");

fs.writeFileSync('src/PurchaseOrdersScreen.tsx', code);

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(/<PurchaseOrdersScreen suppliers=\{suppliers\} products=\{products\} \/>/, "<PurchaseOrdersScreen products={products} />");
fs.writeFileSync('src/App.tsx', appCode);
