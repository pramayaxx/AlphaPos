const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('PublicMenuScreen')) {
  code = code.replace(
    "import { PublicBillScreen } from './PublicBillScreen';",
    "import { PublicBillScreen } from './PublicBillScreen';\nimport { PublicMenuScreen } from './PublicMenuScreen';"
  );
  
  const routeLogic = `
  if (window.location.pathname.startsWith('/public/bill/')) {
    return <PublicBillScreen />;
  }
  `;
  const menuRoute = `
  if (window.location.pathname.startsWith('/public/menu/')) {
    return <PublicMenuScreen />;
  }
  `;
  
  code = code.replace(routeLogic, routeLogic + menuRoute);
  fs.writeFileSync('src/App.tsx', code);
}
