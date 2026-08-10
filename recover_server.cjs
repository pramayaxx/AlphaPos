const fs = require('fs');
const map = JSON.parse(fs.readFileSync('dist/server.cjs.map', 'utf-8'));
const sourceIndex = map.sources.indexOf('../server.ts');
if (sourceIndex !== -1) {
    fs.writeFileSync('server.ts', map.sourcesContent[sourceIndex]);
    console.log('Recovered server.ts from source map!');
} else {
    console.log('Could not find server.ts in source map.');
}
