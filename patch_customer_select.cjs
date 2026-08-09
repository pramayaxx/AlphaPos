const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const customerSelectComponent = `
const CustomerSelect = ({ customers, selectedId, onChange, onAddCustomer }: { customers: Customer[], selectedId: string, onChange: (id: string) => void, onAddCustomer?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    (c.phone && c.phone.includes(query))
  );

  const selectedCustomer = customers.find(c => String(c.id) === String(selectedId));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const saved = await api.post('/customers', { name, phone, email });
      if (onAddCustomer) onAddCustomer();
      onChange(saved.id);
      setShowAdd(false);
      setIsOpen(false);
      setName('');
      setPhone('');
      setEmail('');
    } catch(err) {
      console.error(err);
      alert('Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium flex justify-between items-center cursor-pointer"
      >
        <span>{selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}</span>
        <ChevronDown size={16} className="text-slate-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
          >
            {!showAdd ? (
              <div className="flex flex-col max-h-[300px]">
                <div className="p-2 border-b border-slate-100 relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search customers..." 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 rounded-lg text-sm outline-none"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto">
                  <div 
                    onClick={() => { onChange(''); setIsOpen(false); }}
                    className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer font-medium"
                  >
                    Walk-in Customer
                  </div>
                  {filtered.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => { onChange(c.id.toString()); setIsOpen(false); }}
                      className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex flex-col"
                    >
                      <span className="font-bold">{c.name}</span>
                      {c.phone && <span className="text-xs text-slate-500">{c.phone}</span>}
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      No matching customers
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-slate-100">
                  <button 
                    onClick={() => setShowAdd(true)}
                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add New Customer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="p-4 flex flex-col gap-3">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2" onClick={() => setShowAdd(false)}>
                  <ChevronLeft size={16} className="cursor-pointer" /> New Customer
                </h4>
                <input 
                  type="text" 
                  placeholder="Name" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                />
                <input 
                  type="tel" 
                  placeholder="Phone" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                />
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold mt-2"
                >
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
`;

code = code.replace("const Checkout = ", customerSelectComponent + "\nconst Checkout = ");

const oldSelect = `
              <select 
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium outline-none focus:border-blue-500"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
`;

const newSelect = `
              <CustomerSelect 
                customers={customers} 
                selectedId={selectedCustomerId} 
                onChange={setSelectedCustomerId} 
                onAddCustomer={onAddCustomer}
              />
`;

code = code.replace(oldSelect.trim(), newSelect.trim());

fs.writeFileSync('src/App.tsx', code);
