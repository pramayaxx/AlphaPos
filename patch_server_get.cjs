const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/syncProvider: 'none',\s*liveSync: false,/g, "");
code = code.replace(/sync_provider: s\.sync_provider,\s*live_sync: s\.live_sync,/g, "");
code = code.replace(/syncProvider: s\.sync_provider,\s*liveSync: s\.live_sync,/g, "");

fs.writeFileSync('server.ts', code);
