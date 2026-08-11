const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldSettingsRoute = `const { name, phone, address, receipt_footer } = req.body;
    const data = await sql\`UPDATE shop_settings SET name = \${name}, phone = \${phone}, address = \${address}, receipt_footer = \${receipt_footer} WHERE user_id = \${req.user.tenantId} RETURNING *\`;`;

const newSettingsRoute = `const { name, phone, address, receipt_footer, enable_loyalty_tiers, scale_integration, barcode_scanner_mode } = req.body;
    const data = await sql\`UPDATE shop_settings SET 
      name = \${name}, 
      phone = \${phone}, 
      address = \${address}, 
      receipt_footer = \${receipt_footer},
      enable_loyalty_tiers = \${enable_loyalty_tiers !== undefined ? enable_loyalty_tiers : false},
      scale_integration = \${scale_integration !== undefined ? scale_integration : false},
      barcode_scanner_mode = \${barcode_scanner_mode !== undefined ? barcode_scanner_mode : false}
      WHERE user_id = \${req.user.tenantId} RETURNING *\`;`;

code = code.replace(oldSettingsRoute, newSettingsRoute);
fs.writeFileSync('server.ts', code);
