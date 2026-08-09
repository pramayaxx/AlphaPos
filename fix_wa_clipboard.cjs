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
              const file = new File([blob], \`bill-\${lastBill.uuid}.png\`, { type: 'image/png' });
              
              if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                  await navigator.share({
                    title: 'Invoice',
                    text: text,
                    files: [file]
                  });
                } catch (shareErr) {
                   console.log('Share canceled or failed', shareErr);
                }
              } else {
                // Fallback for desktop where share is not available
                try {
                   // Copy image to clipboard so they can just Ctrl+V in WhatsApp
                   const clipboardItem = new ClipboardItem({ 'image/png': blob });
                   await navigator.clipboard.write([clipboardItem]);
                   
                   // Alert the user so they know what to do
                   alert("Invoice image copied to your clipboard! \\n\\nAfter WhatsApp opens, just PASTE the image into the chat to send it with the message.");
                } catch (clipboardErr) {
                   console.error("Clipboard failed", clipboardErr);
                   // Download as last resort
                   const url = window.URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.style.display = 'none';
                   a.href = url;
                   a.download = \`bill-\${lastBill.uuid}.png\`;
                   document.body.appendChild(a);
                   a.click();
                   window.URL.revokeObjectURL(url);
                   a.remove();
                }
                
                setTimeout(() => {
                  window.open(waUrl, '_blank');
                }, 300);
              }
            } else {
               window.open(waUrl, '_blank');
            }
          }, 'image/png', 1.0);
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
console.log("Fixed WA share with clipboard");
