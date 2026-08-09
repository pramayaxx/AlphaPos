import React, { useState, useEffect } from 'react';
import { Armchair, Plus, CheckCircle } from 'lucide-react';

const TablesScreen = ({ onTableSelect }: { onTableSelect: (table: any) => void }) => {
  const [tables, setTables] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTable, setNewTable] = useState({ name: '', capacity: 4 });

  const fetchData = async () => {
    try {
      const res = await (window as any).api.get('/tables');
      setTables(res);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    try {
      await (window as any).api.post('/tables', newTable);
      fetchData();
      setShowAdd(false);
      setNewTable({ name: '', capacity: 4 });
    } catch(err: any) { alert(err.message); }
  };

  const markAvailable = async (e: any, id: string) => {
    e.stopPropagation();
    try {
      await (window as any).api.put(`/tables/${id}/status`, { status: 'AVAILABLE' });
      fetchData();
    } catch(err: any) { alert(err.message); }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Tables</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Restaurant Floor Plan</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
        >
          <Plus size={20} /> Add Table
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tables.map(t => {
            const isOccupied = t.status === 'OCCUPIED';
            return (
              <div 
                key={t.id} 
                onClick={() => onTableSelect(t)}
                className={`cursor-pointer p-6 rounded-3xl border-2 shadow-sm flex flex-col items-center justify-center text-center aspect-square transition-all hover:scale-105
                ${isOccupied 
                  ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20' 
                  : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20 hover:border-emerald-400'}`}
              >
                <Armchair size={40} className={isOccupied ? 'text-red-500' : 'text-emerald-500'} />
                <h3 className={`text-2xl font-black mt-3 ${isOccupied ? 'text-red-900 dark:text-red-100' : 'text-emerald-900 dark:text-emerald-100'}`}>
                  {t.name}
                </h3>
                <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${isOccupied ? 'text-red-500' : 'text-emerald-500'}`}>
                  {t.status}
                </p>
                {isOccupied && (
                  <button onClick={(e) => markAvailable(e, t.id)} className="mt-4 text-xs bg-red-200 hover:bg-red-300 text-red-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <CheckCircle size={14} /> Clear
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-xl font-black mb-4">Add New Table</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required type="text" placeholder="Table Name / Number" value={newTable.name} onChange={e=>setNewTable({...newTable, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3" />
              <input required type="number" placeholder="Capacity (Seats)" value={newTable.capacity} onChange={e=>setNewTable({...newTable, capacity: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3" />
              <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl">Save Table</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TablesScreen;
