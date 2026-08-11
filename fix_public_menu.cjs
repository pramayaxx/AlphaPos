const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  "SELECT id, name, price, category, barcode, sku, allow_partial_quantities, is_recipe FROM products WHERE user_id = \\${tenantId}",
  "SELECT id, name, price, category, item_number, image_url FROM products WHERE user_id = \\${tenantId}"
);

fs.writeFileSync('server.ts', code);
