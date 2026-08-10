import { api } from './api';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Tag, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { type Product } from './db';

const PromotionsScreen = ({ products }: { products: Product[] }) => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newPromo, setNewPromo] = useState({
    name: '',
    promo_type: 'PERCENT_OFF',
    discount_percent: 10,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setDate(new Date().getDate()+7)).toISOString().split('T')[0],
    is_active: true
  });

  const fetchData = async () => {
    try {
      const res = await api.get('/promotions');
      setPromotions(res);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/promotions', {
        ...newPromo,
        start_date: new Date(newPromo.start_date).toISOString(),
        end_date: new Date(newPromo.end_date).toISOString()
      });
      fetchData();
      setShowAdd(false);
    } catch(err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Advanced Promotions</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Manage Store-wide Discounts & Offers</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Promo
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Campaign Name</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Type / Value</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {promotions.map((p, i) => (
                <tr key={p.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Tag size={20} />
                    </div>
                    {p.name}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{p.promo_type}</span>
                    {p.discount_percent && <div className="text-sm text-emerald-600 font-bold">{p.discount_percent}% OFF</div>}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                    {format(new Date(p.start_date), 'MMM d')} - {format(new Date(p.end_date), 'MMM d')}
                  </td>
                  <td className="p-4">
                    {p.is_active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-bold"><CheckCircle2 size={16}/> Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 text-sm font-bold"><XCircle size={16}/> Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-bold">No active promotions.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6">Create Campaign</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Campaign Name</label>
                <input required type="text" value={newPromo.name} onChange={e=>setNewPromo({...newPromo, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Promo Type</label>
                <select value={newPromo.promo_type} onChange={e=>setNewPromo({...newPromo, promo_type: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium">
                  <option value="PERCENT_OFF">Percentage Off</option>
                  <option value="BOGO">Buy 1 Get 1 (BOGO)</option>
                </select>
              </div>
              {newPromo.promo_type === 'PERCENT_OFF' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Discount (%)</label>
                  <input required type="number" min="1" max="100" value={newPromo.discount_percent} onChange={e=>setNewPromo({...newPromo, discount_percent: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                  <input required type="date" value={newPromo.start_date} onChange={e=>setNewPromo({...newPromo, start_date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">End Date</label>
                  <input required type="date" value={newPromo.end_date} onChange={e=>setNewPromo({...newPromo, end_date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium" />
                </div>
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl mt-4">Launch Campaign</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsScreen;
