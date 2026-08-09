const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const handleShareWhatsApp = async \(e: React\.MouseEvent\) => \{[\s\S]*?    \};/m;

const replacement = `const handleShareWhatsApp = async (e: React.MouseEvent) => {
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
          // Fallback for Desktop: Download the PDF first, then open WhatsApp
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = \`bill-\${lastBill.uuid}.pdf\`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          
          window.open(waUrl, '_blank');
        }
      } catch (err) {
        console.error('Error sharing:', err);
        window.open(waUrl, '_blank');
      }
    };`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Share Fallback");
