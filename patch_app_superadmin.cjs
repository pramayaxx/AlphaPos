const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Update User interface
code = code.replace(
  /export interface User \{[\s\S]*?\}/,
  "export interface User {\n  id: string;\n  username: string;\n  email: string;\n  role: string;\n  is_superadmin?: boolean;\n  package_type?: string;\n  status?: string;\n}"
);

// Import SuperAdminScreen
if (!code.includes('import SuperAdminScreen')) {
  code = code.replace(/import StaffScreen/, "import SuperAdminScreen from './SuperAdminScreen';\nimport StaffScreen");
}

// Render SuperAdminScreen if is_superadmin
const renderLogic = "  if (!currentUser) {\n    return <AuthScreen />;\n  }\n  if (currentUser.is_superadmin) {\n    return <SuperAdminScreen onLogout={() => {\n      localStorage.removeItem('token');\n      setCurrentUser(null);\n      window.location.reload();\n    }} />;\n  }";

code = code.replace(/if \(\!currentUser\) \{\s*return <AuthScreen \/>;\s*\}/, renderLogic);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx to support Super Admin render and User type.");
