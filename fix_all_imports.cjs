const fs = require('fs');
const glob = require('fs').readdirSync('src').filter(f => f.endsWith('.tsx'));

glob.forEach(file => {
    let code = fs.readFileSync('src/' + file, 'utf-8');
    let originalCode = code;
    code = code.replace(/import \{.*?api.*?\} from '\.\/App';/g, "import { api } from './api';\nimport { User } from './db';");
    // Some might have other imports from App, so let's just do a string replace of api
    if (code !== originalCode) {
        fs.writeFileSync('src/' + file, code);
    }
});
console.log("Fixed all imports.");
