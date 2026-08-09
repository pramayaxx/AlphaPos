const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf-8');
if (!server.includes('points INTEGER')) {
  server = server.replace(/CREATE TABLE IF NOT EXISTS customers \([\s\S]*?\);/, match => {
    let replaced = match.replace("email TEXT", "email TEXT,\n      points INTEGER DEFAULT 0");
    return replaced;
  });
  
  server = server.replace(/CREATE TABLE IF NOT EXISTS bills \([\s\S]*?\);/, match => {
    let replaced = match.replace("discount_value REAL", "discount_value REAL,\n      points_earned INTEGER DEFAULT 0,\n      points_redeemed INTEGER DEFAULT 0");
    return replaced;
  });

  fs.writeFileSync('server.ts', server);
  console.log("Patched server.ts with points schema");
}

let db = fs.readFileSync('src/db.ts', 'utf-8');
if (!db.includes('points?: number')) {
  db = db.replace(/export interface Customer \{[\s\S]*?\}/, match => {
    let lines = match.split('\n');
    lines.splice(lines.length - 1, 0, '  points?: number;');
    return lines.join('\n');
  });
  
  db = db.replace(/export interface Bill \{[\s\S]*?\}/, match => {
    let lines = match.split('\n');
    lines.splice(lines.length - 1, 0, '  points_earned?: number;\n  points_redeemed?: number;');
    return lines.join('\n');
  });

  fs.writeFileSync('src/db.ts', db);
  console.log("Patched src/db.ts with points schema");
}
