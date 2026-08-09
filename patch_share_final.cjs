const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const handleShareWhatsApp = async \(e: React\.MouseEvent\) => \{[\s\S]*?    \};/m;

const replacement = `const handleShareWhatsApp = async (e: React.MouseEvent) => {
      e.preventDefault();
      
      // Open WhatsApp chat directly as before
      window.open(waUrl, '_blank');

      try {
        const element = document.getElementById('receipt');
        if (element) {
          const opt = {
            margin:       10,
            filename:     \`bill-\${lastBill.uuid}.pdf\`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          // @ts-ignore
          html2pdf().set(opt).from(element).save();
        }
      } catch (err) {
        console.error('Error generating PDF:', err);
      }
    };`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Share Final");
