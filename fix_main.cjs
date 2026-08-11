const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');

if (!code.includes('I18nProvider')) {
  code = code.replace(
    "import { ThemeProvider } from './ThemeContext.tsx';",
    "import { ThemeProvider } from './ThemeContext.tsx';\nimport { I18nProvider } from './i18n.tsx';"
  );
  code = code.replace(
    "<App />",
    "<I18nProvider><App /></I18nProvider>"
  );
  fs.writeFileSync('src/main.tsx', code);
}
