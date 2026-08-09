const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const importRegex = /Area\s*\} from 'recharts';/;
if (!importRegex.test(code)) {
    console.log("Could not find recharts import");
} else {
    code = code.replace(/Area\s*\} from 'recharts';/, "Area,\n  BarChart,\n  Bar\n} from 'recharts';");
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched imports successfully!");
}
