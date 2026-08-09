const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "  PieChart as PieChartIcon\n  UserCircle2",
  "  PieChart as PieChartIcon,\n  UserCircle2"
);

fs.writeFileSync('src/App.tsx', code);
