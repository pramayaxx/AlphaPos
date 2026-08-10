const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

for (let i = 190; i < 350; i++) {
  if (lines[i] && lines[i].includes('await sql`')) {
     lines[i] = lines[i].replace('await sql`', 'await sql.unsafe(`');
  }
  if (lines[i] && lines[i].match(/^\s*`;$/)) {
     lines[i] = lines[i].replace('`;', '`);');
  }
}
fs.writeFileSync('server.ts', lines.join('\n'));
console.log('Fixed exactly lines 190 to 350');
