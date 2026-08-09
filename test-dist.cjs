const app = require('./dist/server.cjs');
console.log("Keys:", Object.keys(app));
console.log("Type:", typeof app);
console.log("Type of app.default:", typeof app.default);
