import React, { useState, useEffect } from 'react';
import { PackageMinus, Plus, X, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { api } from './api';
import { User } from './db';
import { type StockAdjustment, type Product } from './db';

const StockAdjustmentsScreen = ({ products }: { products: Product[] }) => {
  const [records, setRecords] = useState<StockAdjustment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [changeAmount, setChangeAmount] = useState('');
  const [reason, setReason] = useState('');

  const fetchRecords = async () => {
    try {
      const res = await api.get('/stock-adjustments');
      setRecords(res);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !changeAmount) return;
    
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const amount = parseInt(changeAmount);
    
    // Check if deducting more than available
    if (amount < 0 && prod.stock_quantity + amount < 0) {
      if (!confirm(`This will drop the stock below zero (\${prod.stock_quantity + amount}). Continue?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await api.post('/stock-adjustments', { 
        product_id: selectedProductId,
        product_name: prod.name,
        change_amount: amount,
        reason: reason || 'Audit / Manual Adjustment'
      });
      fetchRecords();
      
      // Update local product list so we don't have to fully reload for UI feedback
      prod.stock_quantity += amount;
      
      setShowAdd(false);
      setSelectedProductId(''); setChangeAmount(''); setReason(''); setSearchQuery('');
    } catch(err: any) {
      alert(err.message || 'Failed to record adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.item_number && p.item_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Stock Adjustments</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Inventory Audits & Losses</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2"
        >
          <Plus size={20} />
          New Adjustment
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Date</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Product</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Reason</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{format(new Date(r.created_at), 'MMM dd, yyyy HH:mm')}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                    {r.current_product_name || r.product_name}
                    {r.current_product_name && r.current_product_name !== r.product_name && (
                      <span className="ml-2 text-xs text-slate-400">(was: {r.product_name})</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{r.reason}</td>
                  <td className={`p-4 font-black text-right \${r.change_amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {r.change_amount > 0 ? '+' : ''}{r.change_amount}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-bold">No stock adjustments recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <AlertCircle size={24} className="text-amber-500" />
                  Adjust Stock Level
                </h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-auto pr-2">
                <form id="adj-form" onSubmit={handleAdd} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Search Product</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 font-medium outline-none focus:border-amber-500" 
                        placeholder="Type to search..." 
                      />
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    {filteredProducts.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedProductId(p.id)}
                        className={`p-3 border-b border-slate-200 dark:border-slate-700/50 cursor-pointer transition-colors \${selectedProductId === p.id ? 'bg-amber-100 dark:bg-amber-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      >
                        <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                        <div className="text-xs text-slate-500">Stock: {p.stock_quantity} | {p.item_number}</div>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="p-4 text-center text-slate-500 text-sm font-bold">No products found</div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Adjustment Amount *</label>
                      <input 
                        type="number" 
                        value={changeAmount} 
                        onChange={e => setChangeAmount(e.target.value)} 
                        required 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-black text-lg outline-none focus:border-amber-500" 
                        placeholder="e.g. -5 or 10" 
                      />
                      <p className="text-xs text-slate-500 mt-1">Use negative numbers for loss/damage.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Reason</label>
                    <input 
                      type="text" 
                      value={reason} 
                      onChange={e => setReason(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none focus:border-amber-500" 
                      placeholder="e.g. Damaged goods, found in audit" 
                    />
                  </div>
                </form>
              </div>

              <div className="pt-4 shrink-0 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button type="submit" form="adj-form" disabled={isSubmitting || !selectedProductId} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Confirm Adjustment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockAdjustmentsScreen;
