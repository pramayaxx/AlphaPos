const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// The block to extract is from `if (process.env.NODE_ENV !== 'production') {` up to `app.get('*', (req, res) => { res.sendFile(...) }); }` but carefully separated.

// Let's just find the start:
const startStr = "if (process.env.NODE_ENV !== 'production') {";
const startIdx = code.indexOf(startStr);

// We know the structure:
// if (process.env.NODE_ENV !== 'production') { ... } else { const distPath = path.join(process.cwd(), 'dist'); app.use(express.static(distPath));
const elseStartStr = "} else {\n    const distPath = path.join(process.cwd(), 'dist');\n    app.use(express.static(distPath));";
const elseStartIdx = code.indexOf(elseStartStr);

// Then there are the two POST routes.
const postRoutesStartIdx = code.indexOf("app.post('/api/bills/:uuid/send-receipt'");
const getCatchAllStartIdx = code.indexOf("app.get('*', (req, res) => {");
const getCatchAllEndIdx = code.indexOf("});\n  }\n", getCatchAllStartIdx) + "});\n  }\n".length;

if (startIdx === -1 || elseStartIdx === -1 || postRoutesStartIdx === -1 || getCatchAllStartIdx === -1) {
  console.log("Could not find the blocks");
  process.exit(1);
}

const viteBlock = code.substring(startIdx, elseStartIdx);
const staticBlock = "} else {\n    const distPath = path.join(process.cwd(), 'dist');\n    app.use(express.static(distPath));\n";
const postRoutes = code.substring(postRoutesStartIdx, getCatchAllStartIdx);
const catchAllBlock = code.substring(getCatchAllStartIdx, getCatchAllEndIdx);

// Construct the new order.
// We remove the old blocks from their original location (from startIdx to getCatchAllEndIdx).
// Replace with just the postRoutes.
// Then insert the middleware block (viteBlock + staticBlock + catchAllBlock) right before app.listen.

const originalBlock = code.substring(startIdx, getCatchAllEndIdx);
code = code.replace(originalBlock, postRoutes);

const listenIdx = code.lastIndexOf("app.listen(PORT");
if (listenIdx === -1) {
  console.log("Could not find app.listen");
  process.exit(1);
}

const middlewareBlock = `\n  ${viteBlock}${staticBlock}    ${catchAllBlock}\n  `;
code = code.substring(0, listenIdx) + middlewareBlock + code.substring(listenIdx);

fs.writeFileSync('server.ts', code);
console.log('Fixed middleware order');
