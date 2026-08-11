const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove import
code = code.replace(/import KDSScreen from '\.\/KDSScreen';\n/, '');

// Remove SidebarItem
code = code.replace(/\{currentUser\?\.package_type !== 'BASIC' && <SidebarItem icon=\{ChefHat\} label="KDS" active=\{activeTab === 'kds'\} onClick=\{\(\) => setActiveTab\('kds'\)\} \/>\}\n/, '');

// Remove screen
code = code.replace(/\{activeTab === 'kds' && <KDSScreen \/>\}\n/, '');

fs.writeFileSync('src/App.tsx', code);
