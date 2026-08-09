const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "if (!isOnline) return { icon: Lock, text: 'Offline Mode', color: 'text-rose-600', bg: 'bg-rose-50', pulse: true, spin: false, sub: 'Using local storage' };",
  "if (!isOnline) return { icon: Lock, text: 'No Connection', color: 'text-rose-600', bg: 'bg-rose-50', pulse: true, spin: false, sub: 'App is offline' };"
);

code = code.replace(
  "return { icon: CheckCircle2, text: 'Cloud Online', color: 'text-emerald-600', bg: 'bg-emerald-50', pulse: false, spin: false, sub: 'Cloud sync active' };",
  "return { icon: CheckCircle2, text: 'Database Online', color: 'text-emerald-600', bg: 'bg-emerald-50', pulse: false, spin: false, sub: 'Connected' };"
);

fs.writeFileSync('src/App.tsx', code);
