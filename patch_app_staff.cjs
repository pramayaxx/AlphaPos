const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const stateCode = "const [currentStaff, setCurrentStaff] = useState<any>(null);\n  const [staffList, setStaffList] = useState<any[]>([]);\n  useEffect(() => {\n    if(currentUser) {\n       window.api.get('/staff').then(res => setStaffList(res)).catch(e => {});\n    }\n  }, [currentUser]);";

if (!code.includes('currentStaff')) {
  code = code.replace(/const \[currentUser, setCurrentUser\] = useState<User \| null>\(null\);/, stateCode + "\n  const [currentUser, setCurrentUser] = useState<User | null>(null);");
}

const pinScreenCode = `
  if (currentUser && !currentUser.is_superadmin && staffList.length > 0 && !currentStaff) {
    return (
      <div className="flex h-screen bg-slate-900 items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-3xl max-w-md w-full text-center">
          <h2 className="text-2xl font-black text-white mb-6">Staff Unlock</h2>
          <div className="grid grid-cols-2 gap-4">
            {staffList.map(s => (
              <button key={s.id} onClick={() => {
                const pin = prompt('Enter PIN for ' + s.full_name);
                if (pin === s.pin) setCurrentStaff(s);
                else alert('Incorrect PIN');
              }} className="bg-slate-700 hover:bg-slate-600 text-white font-bold p-4 rounded-2xl flex flex-col items-center gap-2">
                 <UserCircle2 size={32} />
                 {s.full_name}
              </button>
            ))}
          </div>
          <button onClick={() => {
            localStorage.removeItem('token');
            setCurrentUser(null);
            window.location.reload();
          }} className="mt-8 text-slate-500 font-bold text-sm">Logout Tenant</button>
        </div>
      </div>
    );
  }
`;

if (!code.includes('Staff Unlock')) {
  code = code.replace(/if \(currentUser\.is_superadmin\) \{[\s\S]*?\}/, match => match + '\n' + pinScreenCode);
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for Staff Unlock screen");
