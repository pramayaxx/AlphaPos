const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const canvas = await html2canvas\(element, \{ scale: 2 \}\);\s*canvas\.toBlob\(async \(blob\) => \{/m;
const replacement = `const canvas = await html2canvas(element, { 
            scale: Math.max(2, window.devicePixelRatio || 2), // Better quality for high DPI screens
            useCORS: true, 
            backgroundColor: '#ffffff', // Ensure solid background for JPG
            logging: false
          });
          canvas.toBlob(async (blob) => {`;

code = code.replace(regex, replacement);

const regex2 = /\}, 'image\/jpeg', 1\.0\);/m;
const replacement2 = `}, 'image/jpeg', 0.92); // Optimize file size while maintaining quality`;

code = code.replace(regex2, replacement2);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched html2canvas settings");
