const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/import PDFDocument from 'pdfkit';\n/g, '');
code = code.replace("import express from 'express';", "import express from 'express';\nimport PDFDocument from 'pdfkit';");
fs.writeFileSync('server.ts', code);
