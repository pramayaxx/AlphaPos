const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  'import { useTheme } from "./ThemeContext";',
  'import { useTheme } from "./ThemeContext";\nimport { useTranslation } from "./i18n";\nimport { ReservationsScreen } from "./ReservationsScreen";\nimport { PublicBillScreen } from "./PublicBillScreen";\nimport { PublicMenuScreen } from "./PublicMenuScreen";'
);
fs.writeFileSync('src/App.tsx', code);
