const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf-8');

code = code.replace(
  /#receipt \{/,
  "body {\n    background: white !important;\n    color: black !important;\n  }\n  * {\n    -webkit-print-color-adjust: exact !important;\n    print-color-adjust: exact !important;\n  }\n  #receipt {"
);

fs.writeFileSync('src/index.css', code);
console.log("Patched print css");
