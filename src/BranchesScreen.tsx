import { api } from './api';
import React, { useState, useEffect } from 'react';
import { Store, Plus, MapPin } from 'lucide-react';

const BranchesScreen = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', location: '' });

  const fetchData = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/branches', newBranch);
      fetchData();
      setShowAdd(false);
      setNewBranch({name: '', location: ''});
    } catch(err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Branches & Locations</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Multi-Store Management</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Branch
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map(b => (
            <div key={b.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Store size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{b.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-2">
                <MapPin size={14} /> {b.location || 'No location set'}
              </p>
              <button className="mt-6 w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors">
                Manage Stock
              </button>
            </div>
          ))}
          {branches.length === 0 && (
            <div className="col-span-full text-center p-12 text-slate-500 dark:text-slate-400 font-bold">
              No branches found. Add your first store location!
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6">Add New Branch</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Branch Name</label>
                <input required type="text" value={newBranch.name} onChange={e=>setNewBranch({...newBranch, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Location / Address</label>
                <input type="text" value={newBranch.location} onChange={e=>setNewBranch({...newBranch, location: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl mt-4">Create Branch</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesScreen;
