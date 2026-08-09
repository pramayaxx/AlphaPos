const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "  const [currentStaff, setCurrentStaff] = useState<any>(null);\n" +
  "  const [staffList, setStaffList] = useState<any[]>([]);\n" +
  "  useEffect(() => {\n" +
  "    if(currentUser) {\n" +
  "       window.api.get('/staff').then(res => setStaffList(res)).catch(e => {});\n" +
  "    }\n" +
  "  }, [currentUser]);\n" +
  "  const [currentUser, setCurrentUser] = useState<User | null>(null);",
  "  const [currentUser, setCurrentUser] = useState<User | null>(null);\n" +
  "  const [currentStaff, setCurrentStaff] = useState<any>(null);\n" +
  "  const [staffList, setStaffList] = useState<any[]>([]);\n" +
  "  useEffect(() => {\n" +
  "    if(currentUser) {\n" +
  "       window.api.get('/staff').then(res => setStaffList(res)).catch(e => {});\n" +
  "    }\n" +
  "  }, [currentUser]);"
);

fs.writeFileSync('src/App.tsx', code);
