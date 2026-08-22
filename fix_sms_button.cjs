const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newButtonCode = `
          <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={handleShareWhatsApp} className="py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128C7E] flex flex-col items-center gap-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp</span>
          </a>
          
          <a href={\`sms:\${phoneStr}?body=\${encodeURIComponent(text)}\`} className="py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 flex flex-col items-center gap-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Send SMS</span>
          </a>
`;

code = code.replace(/<a href=\{waUrl\} target="_blank" rel="noopener noreferrer" onClick=\{handleShareWhatsApp\} className="py-3 bg-\[\#25D366\] text-white font-bold rounded-xl hover:bg-\[\#128C7E\] flex flex-col items-center gap-1 transition-colors">\s*<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11\.5a8\.38 8\.38 0 0 1-\.9 3\.8 8\.5 8\.5 0 0 1-7\.6 4\.7 8\.38 8\.38 0 0 1-3\.8-\.9L3 21l1\.9-5\.7a8\.38 8\.38 0 0 1-\.9-3\.8 8\.5 8\.5 0 0 1 4\.7-7\.6 8\.38 8\.38 0 0 1 3\.8-\.9h\.5a8\.48 8\.48 0 0 1 8 8v\.5z"\/><\/svg>\s*<span>WhatsApp \/ Share<\/span>\s*<\/a>/, newButtonCode);

// Fix grid cols because we added one more button.
code = code.replace(/<div className="grid grid-cols-2 gap-4">/g, '<div className="grid grid-cols-2 md:grid-cols-4 gap-4">');
fs.writeFileSync('src/App.tsx', code);
