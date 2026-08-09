const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf-8');
if (!code.includes('@custom-variant dark')) {
  code = code.replace('@import "tailwindcss";', '@import "tailwindcss";\n@custom-variant dark (&:where(.dark, .dark *));\n');
  fs.writeFileSync('src/index.css', code);
}
