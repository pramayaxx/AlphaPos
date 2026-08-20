import React, { useState, useEffect } from 'react';
import { Banknote, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { api } from './api';
import { User } from './db';
import { type Expense } from './db';

const ExpensesScreen = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    setIsSubmitting(true);
    try {
      await api.post('/expenses', { 
        description, 
        amount: parseFloat(amount), 
        category: category || 'General' 
      });
      fetchExpenses();
      setShowAdd(false);
      setDescription(''); setAmount(''); setCategory('');
    } catch(err: any) {
      alert(err.message || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Expenses</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{expenses.length} Records</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Date</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Description</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Category</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((e, i) => (
                <tr key={e.id || i} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{format(new Date(e.date_time), 'MMM dd, yyyy HH:mm')}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{e.description}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-xs font-bold uppercase">{e.category || 'General'}</span>
                  </td>
                  <td className="p-4 font-black text-red-600 text-right">-${Number(e.amount).toFixed(2)}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">No expenses recorded.</td>
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Add Expense</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Description *</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none" placeholder="e.g. Office Supplies" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Amount *</label>
                  <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Category</label>
                  <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none" placeholder="e.g. Utilities, Maintenance" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl mt-4 text-lg">{isSubmitting ? 'Saving...' : 'Save Expense'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpensesScreen;
