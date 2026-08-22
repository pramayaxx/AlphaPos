import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, Plus, LogOut, Download } from 'lucide-react';
import { format } from 'date-fns';
import { api } from './api';
import { User } from './db';
import { type CashShift, type Bill, type Expense } from './db';

const CashDrawerScreen = ({ bills }: { bills: Bill[] }) => {
  const [currentShift, setCurrentShift] = useState<CashShift | null>(null);
  const [shifts, setShifts] = useState<CashShift[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  
  // Form states
  const [openingBalance, setOpeningBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchShifts = async () => {
    try {
      const current = await api.get('/shifts/current');
      setCurrentShift(current);
      const all = await api.get('/shifts');
      setShifts(all);
      const exp = await api.get('/expenses').catch(() => []);
      setExpenses(exp);
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // Calculate Expected Balance for current shift
  const calculateExpectedBalance = () => {
    if (!currentShift) return 0;
    const shiftStart = new Date(currentShift.opened_at);
    
    // Only cash bills
    const shiftBills = bills.filter(b => new Date(b.dateTime) >= shiftStart && b.paymentMethod === 'cash');
    const cashSales = shiftBills.reduce((acc, b) => acc + b.grandTotal, 0);
    
    // Expenses
    const shiftExpenses = expenses.filter(e => new Date(e.date_time) >= shiftStart);
    const cashExpenses = shiftExpenses.reduce((acc, e) => acc + e.amount, 0);

    return Number(currentShift.opening_balance) + cashSales - cashExpenses;
  };

  const expectedBalance = calculateExpectedBalance();

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/shifts/open', { opening_balance: parseFloat(openingBalance || '0'), notes });
      await fetchShifts();
      setShowOpenModal(false);
      setOpeningBalance(''); setNotes('');
    } catch(err: any) {
      alert(err.message || 'Failed to open shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift) return;
    setIsSubmitting(true);
    try {
      await api.post(`/shifts/${currentShift.id}/close`, { 
        closing_balance: parseFloat(closingBalance || '0'), 
        expected_balance: expectedBalance,
        notes 
      });
      await fetchShifts();
      setShowCloseModal(false);
      setClosingBalance(''); setNotes('');
    } catch(err: any) {
      alert(err.message || 'Failed to close shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 font-bold">Loading...</div>;

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Cash Drawer</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Shift Management</p>
        </div>
        
        {currentShift ? (
          <button onClick={() => setShowCloseModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/30 flex items-center gap-2">
            <LogOut size={20} />
            Close Shift
          </button>
        ) : (
          <button onClick={() => setShowOpenModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2">
            <Wallet size={20} />
            Open Shift
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 space-y-8">
        
        {currentShift && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Shift
              </h3>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                Opened by {currentShift.opened_by} at {format(new Date(currentShift.opened_at), 'hh:mm a')}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Opening Balance</p>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100">${Number(currentShift.opening_balance).toFixed(2)}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Cash Sales (Since Open)</p>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 dark:text-emerald-300">
                  + ${(expectedBalance - Number(currentShift.opening_balance)).toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Expected Drawer</p>
                <p className="text-3xl font-black text-blue-700 dark:text-blue-400 dark:text-blue-300">${expectedBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4">Past Shifts</h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Date/Time</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Opened By</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Closed By</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Expected</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Actual</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {shifts.filter(s => s.status === 'closed').map(s => {
                  const variance = Number(s.closing_balance) - Number(s.expected_balance);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                        {format(new Date(s.opened_at), 'MMM dd')} <br/>
                        <span className="text-xs text-slate-400">{format(new Date(s.opened_at), 'HH:mm')} - {s.closed_at ? format(new Date(s.closed_at), 'HH:mm') : ''}</span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{s.opened_by}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{s.closed_by}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium text-right">${Number(s.expected_balance).toFixed(2)}</td>
                      <td className="p-4 font-black text-slate-900 dark:text-slate-100 text-right">${Number(s.closing_balance).toFixed(2)}</td>
                      <td className={`p-4 font-black text-right ${variance > 0 ? 'text-emerald-600 dark:text-emerald-400' : variance < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                        {variance > 0 ? '+' : ''}{variance.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
                {shifts.filter(s => s.status === 'closed').length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">No past shifts recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showOpenModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowOpenModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Open Register</h3>
                <button onClick={() => setShowOpenModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400"><X size={20} /></button>
              </div>
              <form onSubmit={handleOpenShift} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Opening Cash Balance *</label>
                  <input type="number" step="0.01" min="0" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-black text-lg outline-none" placeholder="0.00" autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Notes (Optional)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none" placeholder="e.g. Added $50 coins to float" rows={3}></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl mt-4 text-lg">{isSubmitting ? 'Opening...' : 'Open Shift'}</button>
              </form>
            </motion.div>
          </div>
        )}

        {showCloseModal && currentShift && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCloseModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Close Register</h3>
                <button onClick={() => setShowCloseModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400"><X size={20} /></button>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 text-center">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Expected Balance</p>
                <p className="text-3xl font-black text-blue-700 dark:text-blue-400 dark:text-blue-300">${expectedBalance.toFixed(2)}</p>
              </div>

              <form onSubmit={handleCloseShift} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Actual Cash in Drawer *</label>
                  <input type="number" step="0.01" min="0" value={closingBalance} onChange={e => setClosingBalance(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-black text-lg outline-none" placeholder="0.00" autoFocus />
                </div>
                {closingBalance && (
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Variance:</span>
                    <span className={`font-black ${(parseFloat(closingBalance) - expectedBalance) === 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${(parseFloat(closingBalance) - expectedBalance).toFixed(2)}
                    </span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Notes (Required if variance)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} required={(closingBalance && parseFloat(closingBalance) !== expectedBalance) ? true : false} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none" placeholder="Explain any discrepancy..." rows={3}></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl mt-4 text-lg">{isSubmitting ? 'Closing...' : 'Close Shift'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CashDrawerScreen;
