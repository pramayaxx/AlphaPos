const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const handleShareWhatsApp = async \(e: React\.MouseEvent\) => \{[\s\S]*?console\.error\('Error sharing:', err\);\s*window\.open\(waUrl, '_blank'\);\s*\}\s*\};/m;

const replacement = `const handleShareWhatsApp = async (e: React.MouseEvent) => {
      e.preventDefault();
      try {
        const element = document.getElementById('receipt');
        if (element) {
          const canvas = await html2canvas(element, { scale: 2 });
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], \`bill-\${lastBill.uuid}.jpg\`, { type: 'image/jpeg' });
              
              if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                  await navigator.share({
                    title: 'Invoice',
                    text: text,
                    files: [file]
                  });
                } catch (shareErr) {
                   console.log('Share canceled or failed', shareErr);
                   // Fallback to old behavior if share fails
                   const url = window.URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.style.display = 'none';
                   a.href = url;
                   a.download = \`bill-\${lastBill.uuid}.jpg\`;
                   document.body.appendChild(a);
                   a.click();
                   window.URL.revokeObjectURL(url);
                   a.remove();
                   setTimeout(() => {
                     window.open(waUrl, '_blank');
                   }, 500);
                }
              } else {
                // 1. Download the JPG image so it's ready to attach
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = \`bill-\${lastBill.uuid}.jpg\`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                
                // 2. Open WhatsApp chat with the customer number pre-filled
                setTimeout(() => {
                  window.open(waUrl, '_blank');
                }, 500);
              }
            } else {
               window.open(waUrl, '_blank');
            }
          }, 'image/jpeg', 0.98);
        } else {
           window.open(waUrl, '_blank');
        }
      } catch (err) {
        console.error('Error sharing:', err);
        window.open(waUrl, '_blank');
      }
    };`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed WA share with navigator");
