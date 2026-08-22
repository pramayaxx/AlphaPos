const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  content = content.replace(/className=(['"])(.*?)\1|className=\{`([^`]+)`\}/g, (match, quote, p2, p3) => {
    let classes = p2 || p3;
    if (!classes) return match;
    
    let originalClasses = classes;

    if (classes.includes('text-slate-700') && !classes.includes('dark:text-')) {
      classes = classes.replace(/\btext-slate-700\b/g, 'text-slate-700 dark:text-slate-300');
    }
    
    // Check for other text-slate things we missed
    if (classes.includes('text-gray-400') && !classes.includes('dark:text-')) {
      classes = classes.replace(/\btext-gray-400\b/g, 'text-gray-400 dark:text-gray-500');
    }

    if (classes !== originalClasses) {
      changed = true;
      if (p2) return `className=${quote}${classes}${quote}`;
      if (p3) return `className={\`${classes}\`}`;
    }
    
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated label classes in ${file}`);
  }
});
