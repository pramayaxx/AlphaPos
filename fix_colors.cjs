const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');
const colors = ['emerald', 'amber', 'rose', 'blue', 'indigo', 'purple', 'sky', 'teal', 'cyan', 'yellow', 'orange', 'red'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  content = content.replace(/className=(['"])(.*?)\1|className=\{`([^`]+)`\}/g, (match, quote, p2, p3) => {
    let classes = p2 || p3;
    if (!classes) return match;
    
    let originalClasses = classes;

    colors.forEach(c => {
      // Backgrounds 50 and 100
      if (classes.includes(`bg-${c}-50`) && !classes.includes(`dark:bg-${c}-900`)) {
        classes = classes.replace(new RegExp(`\\bbg-${c}-50\\b`, 'g'), `bg-${c}-50 dark:bg-${c}-900/20`);
      }
      if (classes.includes(`bg-${c}-100`) && !classes.includes(`dark:bg-${c}-900`)) {
        classes = classes.replace(new RegExp(`\\bbg-${c}-100\\b`, 'g'), `bg-${c}-100 dark:bg-${c}-900/30`);
      }
      if (classes.includes(`hover:bg-${c}-100`) && !classes.includes(`dark:hover:bg-${c}-900`)) {
        classes = classes.replace(new RegExp(`\\bhover:bg-${c}-100\\b`, 'g'), `hover:bg-${c}-100 dark:hover:bg-${c}-900/40`);
      }
      if (classes.includes(`hover:bg-${c}-200`) && !classes.includes(`dark:hover:bg-${c}-900`)) {
        classes = classes.replace(new RegExp(`\\bhover:bg-${c}-200\\b`, 'g'), `hover:bg-${c}-200 dark:hover:bg-${c}-900/50`);
      }
      
      // Text colors 600, 700
      if (classes.includes(`text-${c}-600`) && !classes.includes(`dark:text-${c}-400`) && !classes.includes(`dark:text-${c}-500`)) {
        classes = classes.replace(new RegExp(`\\btext-${c}-600\\b`, 'g'), `text-${c}-600 dark:text-${c}-400`);
      }
      if (classes.includes(`text-${c}-700`) && !classes.includes(`dark:text-${c}-400`) && !classes.includes(`dark:text-${c}-500`)) {
        classes = classes.replace(new RegExp(`\\btext-${c}-700\\b`, 'g'), `text-${c}-700 dark:text-${c}-400`);
      }
      
      // Borders 200, 300
      if (classes.includes(`border-${c}-200`) && !classes.includes(`dark:border-${c}-800`)) {
        classes = classes.replace(new RegExp(`\\bborder-${c}-200\\b`, 'g'), `border-${c}-200 dark:border-${c}-800/30`);
      }
    });

    if (classes !== originalClasses) {
      changed = true;
      if (p2) return `className=${quote}${classes}${quote}`;
      if (p3) return `className={\`${classes}\`}`;
    }
    
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated color classes in ${file}`);
  }
});
