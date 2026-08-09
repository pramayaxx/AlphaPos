const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const themeBtn = `
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
`;

code = code.replace(
  /<button \n            onClick=\{\(\) => setShowPreview\(true\)\}/,
  themeBtn.trim() + '\n            onClick={() => setShowPreview(true)}'
);

fs.writeFileSync('src/App.tsx', code);
