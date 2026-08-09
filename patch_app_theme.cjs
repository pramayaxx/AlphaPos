const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/export default function App\(\) \{/, "export default function App() {\n  const { theme, toggleTheme } = useTheme();");

// I mistakenly added it to `MainLayout` before, let me remove it from `MainLayout` if it exists.
code = code.replace(/const MainLayout = \(\{ children, currentUser,[\s\S]*?\{\n  const \{ theme, toggleTheme \} = useTheme\(\);\n/, "const MainLayout = ({ children, currentUser,");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for useTheme in App function");
