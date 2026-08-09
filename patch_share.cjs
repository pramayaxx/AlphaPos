const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const waUrl = \`https:\/\/wa\.me\/\$\{phoneStr\}\?text=\$\{encodeURIComponent\(text\)\}\`;/;
const replacement = `const waUrl = \`https://wa.me/\${phoneStr}?text=\${encodeURIComponent(text)}\`;

    const handleShareWhatsApp = async (e: React.MouseEvent) => {
      e.preventDefault();
      try {
        const response = await fetch(billUrl);
        const blob = await response.blob();
        const file = new File([blob], \`bill-\${lastBill.uuid}.pdf\`, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: \`Invoice \${lastBill.uuid}\`,
            text: text,
            files: [file]
          });
        } else {
          window.open(waUrl, '_blank');
        }
      } catch (err) {
        console.error('Error sharing:', err);
        window.open(waUrl, '_blank');
      }
    };`;

code = code.replace(regex, replacement);

const buttonRegex = /<a href=\{waUrl\} target="_blank" rel="noopener noreferrer" (className="py-3 bg-\[#25D366\][^>]+>)[\s\S]*?<\/a>/;
const buttonReplacement = `<button onClick={handleShareWhatsApp} $1
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp / Share</span>
          </button>`;

code = code.replace(buttonRegex, buttonReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Share");
