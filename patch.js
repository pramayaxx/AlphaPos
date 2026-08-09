const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'async function startServer() {',
  `let dbInitialized = false;

app.use(async (req, res, next) => {
  if (process.env.DATABASE_URL && !dbInitialized && process.env.VERCEL) {
    try {
      await initDb();
      dbInitialized = true;
    } catch (e) {
      console.error('Failed to init DB on Vercel:', e);
    }
  }
  next();
});

async function startServer() {
  if (process.env.VERCEL) return;`
);

fs.writeFileSync('server.ts', code);
