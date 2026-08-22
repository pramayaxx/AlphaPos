const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update get settings
code = code.replace(/taxName: s\.tax_name \|\| 'Tax'/g, 
  "taxName: s.tax_name || 'Tax',\n      enableLoyalty: s.enable_loyalty || false,\n      amountPerPoint: Number(s.amount_per_point) || 0,\n      valuePerPoint: Number(s.value_per_point) || 0");

code = code.replace(/taxName: 'Tax'/g, 
  "taxName: 'Tax',\n        enableLoyalty: false,\n        amountPerPoint: 100,\n        valuePerPoint: 1");

// Update post settings
code = code.replace(/tax_rate, tax_name/g, "tax_rate, tax_name, enable_loyalty, amount_per_point, value_per_point");
code = code.replace(/tax_rate = \$\{s.taxRate \|\| 0\}, tax_name = \$\{s.taxName \|\| 'Tax'\}/g, 
  "tax_rate = ${s.taxRate || 0}, tax_name = ${s.taxName || 'Tax'}, enable_loyalty = ${s.enableLoyalty || false}, amount_per_point = ${s.amountPerPoint || 0}, value_per_point = ${s.valuePerPoint || 0}");
code = code.replace(/\$\{s.taxRate \|\| 0\}, \$\{s.taxName \|\| 'Tax'\}/g, 
  "${s.taxRate || 0}, ${s.taxName || 'Tax'}, ${s.enableLoyalty || false}, ${s.amountPerPoint || 0}, ${s.valuePerPoint || 0}");

fs.writeFileSync('server.ts', code);
