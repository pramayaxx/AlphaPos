const fs = require('fs');
let code = fs.readFileSync('src/PurchaseOrdersScreen.tsx', 'utf-8');

code = code.replace(/useEffect\(\(\) => \{\n    fetchPos\(\);\n      const sups = await api\.get\('\/suppliers'\);\n      setSuppliers\(sups\);\n  \}, \[\]\);/, "useEffect(() => {\n    fetchPos();\n  }, []);");

code = code.replace(/const fetchPos = async \(\) => \{\n    try \{\n      const res = await api\.get\('\/purchase-orders'\);\n      setPos\(res\);\n    \} catch\(err\) \{\n      console\.error\(err\);\n    \}\n  \};/, "const fetchPos = async () => {\n    try {\n      const res = await api.get('/purchase-orders');\n      setPos(res);\n      const sups = await api.get('/suppliers');\n      setSuppliers(sups);\n    } catch(err) {\n      console.error(err);\n    }\n  };");

fs.writeFileSync('src/PurchaseOrdersScreen.tsx', code);
