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
              
              let shared = false;
              if (navigator.share) {
                try {
                  await navigator.share({
                    text: text,
                    files: [file]
                  });
                  shared = true; // Successfully shared using OS share sheet
                } catch (shareErr: any) {
                   console.log('Share canceled or failed', shareErr);
                   // If user cancelled (AbortError), we should probably not fallback
                   if (shareErr.name === 'AbortError') {
                       return;
                   }
                }
              }
              
              if (!shared) {
                // Fallback: Download JPG and open specific WhatsApp chat
                try {
                   const url = window.URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.style.display = 'none';
                   a.href = url;
                   a.download = \`bill-\${lastBill.uuid}.jpg\`;
                   document.body.appendChild(a);
                   a.click();
                   window.URL.revokeObjectURL(url);
                   a.remove();
                } catch (e) {}
                
                setTimeout(() => {
                  window.open(waUrl, '_blank');
                }, 300);
              }
            } else {
               window.open(waUrl, '_blank');
            }
          }, 'image/jpeg', 1.0);
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
console.log("Fixed WA share again");
