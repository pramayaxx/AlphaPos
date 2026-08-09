const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /\$\{req\.user\.id\}/g,
  "${req.user.tenantId}"
);

// Oh wait, if I replace ALL ${req.user.id}, then GET /api/auth/me and PUT /api/auth/me will also use tenantId!
// That's wrong. I want auth routes to use req.user.id, and staff routes to use req.user.id to check ownership!

// Let me undo and be precise.
