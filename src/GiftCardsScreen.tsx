import React, { useState, useEffect } from 'react';
import { Gift, Plus, X, Power, PowerOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { api } from './api';
import { User } from './db';
import { type GiftCard } from './db';
import { cn } from './lib/utils';

const GiftCardsScreen = () => {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [code, setCode] = useState('');
  const [balance, setBalance] = useState('');

  const fetchCards = async () => {
    try {
      const res = await api.get('/gift-cards');
      setCards(res);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !balance) return;
    setIsSubmitting(true);
    try {
      await api.post('/gift-cards', { 
        code: code.toUpperCase(), 
        balance: parseFloat(balance)
      });
      fetchCards();
      setShowAdd(false);
      setCode(''); setBalance('');
    } catch(err: any) {
      alert(err.message || 'Failed to issue gift card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.post(`/gift-cards/\${id}/toggle`, { is_active: !currentStatus });
      fetchCards();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Gift Cards</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{cards.filter(c => c.is_active && c.balance > 0).length} Active Cards</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2"
        >
          <Plus size={20} />
          Issue Gift Card
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map(card => {
            const isActive = card.is_active && Number(card.balance) > 0;

            return (
              <div key={card.id} className={cn(
                "relative p-6 rounded-3xl border shadow-sm transition-all flex flex-col gap-4",
                isActive 
                  ? "bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/50" 
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-75"
              )}>
                <div className="flex justify-between items-start">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-2xl">
                    <Gift size={24} />
                  </div>
                  <button 
                    onClick={() => toggleActive(card.id, card.is_active)}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      card.is_active ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                    )}
                    title={card.is_active ? "Disable" : "Enable"}
                  >
                    {card.is_active ? <Power size={18} /> : <PowerOff size={18} />}
                  </button>
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-wider font-mono">{card.code}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-black text-3xl mt-2">
                    ${Number(card.balance).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-500">Issued On</span>
                    <span className="text-slate-900 dark:text-slate-100">{format(new Date(card.issued_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                {!isActive && Number(card.balance) <= 0 && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border border-slate-300">
                    Empty
                  </div>
                )}
              </div>
            );
          })}

          {cards.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 font-bold">
              No gift cards issued yet.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Gift size={24} className="text-indigo-600" />
                  Issue Gift Card
                </h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Card Code *</label>
                  <div className="flex gap-2">
                    <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-black text-lg uppercase outline-none font-mono" placeholder="GC-12345" />
                    <button type="button" onClick={() => setCode('GC-' + Math.random().toString(36).substring(2, 8).toUpperCase())} className="bg-slate-200 dark:bg-slate-700 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600">
                      Gen
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Initial Balance ($) *</label>
                  <input type="number" step="0.01" min="1" value={balance} onChange={e => setBalance(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold outline-none" placeholder="50.00" />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl mt-4 text-lg">{isSubmitting ? 'Issuing...' : 'Issue Card'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftCardsScreen;
