const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const originalSettings = "const SettingsScreen = ({ onPrinterSetup, currentUser, setCurrentUser, syncStatus, settings, setSettings }: { onPrinterSetup: () => void, currentUser: User | null, setCurrentUser: (user: User | null) => void, syncStatus: 'synced' | 'syncing' | 'error' | 'idle', settings: ShopSettings | null, setSettings: (s: ShopSettings) => void }) => {\\n  const \\\[showPreview, setShowPreview\\\] = useState(false);";

const newSettings = "const SettingsScreen = ({ onPrinterSetup, currentUser, setCurrentUser, syncStatus, settings, setSettings }: { onPrinterSetup: () => void, currentUser: User | null, setCurrentUser: (user: User | null) => void, syncStatus: 'synced' | 'syncing' | 'error' | 'idle', settings: ShopSettings | null, setSettings: (s: ShopSettings) => void }) => {\\n  const [showPreview, setShowPreview] = useState(false);\\n  const { theme, toggleTheme } = useTheme();";

code = code.replace(/const SettingsScreen = \(\{ onPrinterSetup.*?useState\(false\);/s, "const SettingsScreen = ({ onPrinterSetup, currentUser, setCurrentUser, syncStatus, settings, setSettings }: { onPrinterSetup: () => void, currentUser: User | null, setCurrentUser: (user: User | null) => void, syncStatus: 'synced' | 'syncing' | 'error' | 'idle', settings: ShopSettings | null, setSettings: (s: ShopSettings) => void }) => {\n  const [showPreview, setShowPreview] = useState(false);\n  const { theme, toggleTheme } = useTheme();");

fs.writeFileSync('src/App.tsx', code);
