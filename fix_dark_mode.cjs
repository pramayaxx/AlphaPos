const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We find all className="..." strings and replace inside them
  content = content.replace(/className=(['"])(.*?)\1|className=\{`([^`]+)`\}/g, (match, quote, p2, p3) => {
    let classes = p2 || p3;
    if (!classes) return match;
    
    let originalClasses = classes;

    // Missing dark mode backgrounds
    if (classes.includes('bg-white') && !classes.includes('dark:bg-')) {
      classes = classes.replace(/\bbg-white\b/g, 'bg-white dark:bg-slate-900');
    }
    
    if (classes.includes('bg-slate-50') && !classes.includes('dark:bg-')) {
      classes = classes.replace(/\bbg-slate-50\b/g, 'bg-slate-50 dark:bg-slate-800');
    }
    
    if (classes.includes('bg-slate-50/50') && !classes.includes('dark:bg-')) {
      classes = classes.replace(/\bbg-slate-50\/50\b/g, 'bg-slate-50/50 dark:bg-slate-800/50');
    }

    // Missing dark mode texts
    if (classes.includes('text-slate-900') && !classes.includes('dark:text-')) {
      classes = classes.replace(/\btext-slate-900\b/g, 'text-slate-900 dark:text-slate-100');
    }
    if (classes.includes('text-slate-800') && !classes.includes('dark:text-')) {
      classes = classes.replace(/\btext-slate-800\b/g, 'text-slate-800 dark:text-slate-200');
    }
    if (classes.includes('text-slate-500') && !classes.includes('dark:text-')) {
      classes = classes.replace(/\btext-slate-500\b/g, 'text-slate-500 dark:text-slate-400');
    }
    if (classes.includes('text-slate-600') && !classes.includes('dark:text-')) {
      classes = classes.replace(/\btext-slate-600\b/g, 'text-slate-600 dark:text-slate-400');
    }
    
    // Missing borders
    if (classes.includes('border-slate-100') && !classes.includes('dark:border-')) {
      classes = classes.replace(/\bborder-slate-100\b/g, 'border-slate-100 dark:border-slate-800');
    }
    if (classes.includes('border-slate-200') && !classes.includes('dark:border-')) {
      classes = classes.replace(/\bborder-slate-200\b/g, 'border-slate-200 dark:border-slate-700');
    }

    // Missing divide
    if (classes.includes('divide-slate-100') && !classes.includes('dark:divide-')) {
      classes = classes.replace(/\bdivide-slate-100\b/g, 'divide-slate-100 dark:divide-slate-800');
    }

    // Input fields usually have focus:ring but we need dark backgrounds if they are white
    if (classes.includes('bg-slate-100') && !classes.includes('dark:bg-')) {
       classes = classes.replace(/\bbg-slate-100\b/g, 'bg-slate-100 dark:bg-slate-800');
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
    console.log(`Updated dark mode classes in ${file}`);
  }
});
