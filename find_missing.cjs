const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let match;
  let re = /className=(['"])(.*?)\1|className=\{`([^`]+)`\}/g;
  
  while ((match = re.exec(content)) !== null) {
    let classes = match[2] || match[3];
    if (!classes) continue;
    
    // Check for light backgrounds without dark background
    if (classes.match(/\bbg-(white|slate-50|slate-100|slate-200)\b/) && !classes.match(/\bdark:bg-/)) {
      console.log(`Missing dark:bg in ${file}: ${classes}`);
    }
    
    // Check for text colors without dark text colors
    if (classes.match(/\btext-(slate-900|slate-800|slate-700|black)\b/) && !classes.match(/\bdark:text-/)) {
      console.log(`Missing dark:text in ${file}: ${classes}`);
    }
    
    // Check for borders without dark borders
    if (classes.match(/\bborder-(slate-100|slate-200|slate-300|gray-200)\b/) && !classes.match(/\bdark:border-/)) {
      console.log(`Missing dark:border in ${file}: ${classes}`);
    }
  }
});
