const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove the second import group addition
code = code.replace(/,\n  BarChart,\n  Bar\n} from 'recharts';/, "\n} from 'recharts';");

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed imports");
