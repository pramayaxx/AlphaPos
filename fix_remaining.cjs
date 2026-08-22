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

    if (classes.includes('bg-slate-200') && !classes.includes('dark:bg-')) {
      classes = classes.replace(/\bbg-slate-200\b/g, 'bg-slate-200 dark:bg-slate-700');
    }
    
    if (classes.includes('border-slate-300') && !classes.includes('dark:border-')) {
      classes = classes.replace(/\bborder-slate-300\b/g, 'border-slate-300 dark:border-slate-700');
    }

    if (classes.includes('bg-slate-900/40') || classes.includes('bg-slate-900/60')) {
      // Modals overlay background - actually fine, but let's make sure they are dark:bg-slate-900/60 if we need them to be light mode aware
      // Wait, modals overlay is usually fine as dark even in light mode. Let's leave as is.
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
    console.log(`Updated classes in ${file}`);
  }
});
