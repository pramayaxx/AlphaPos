import React, { useState, useEffect } from 'react';
import { Ticket, Plus, X, Power, PowerOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { api } from './api';
import { User } from './db';
import { type Coupon } from './db';
import { cn } from './lib/utils';

const CouponsScreen = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;
    setIsSubmitting(true);
    try {
      await api.post('/coupons', { 
        code: code.toUpperCase(), 
        discount_type: discountType, 
        discount_value: parseFloat(discountValue), 
        min_purchase: minPurchase ? parseFloat(minPurchase) : 0, 
        valid_until: validUntil || null 
      });
      fetchCoupons();
      setShowAdd(false);
      setCode(''); setDiscountValue(''); setMinPurchase(''); setValidUntil('');
    } catch(err: any) {
      alert(err.message || 'Failed to add coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.post(`/coupons/${id}/toggle`, { is_active: !currentStatus });
      fetchCoupons();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Coupons & Discounts</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{coupons.filter(c => c.is_active).length} Active</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Coupon
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {coupons.map(coupon => {
            const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
            const isActive = coupon.is_active && !isExpired;

            return (
              <div key={coupon.id} className={cn(
                "relative p-6 rounded-3xl border shadow-sm transition-all flex flex-col gap-4",
                isActive 
                  ? "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/50" 
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-75"
              )}>
                <div className="flex justify-between items-start">
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-2xl">
                    <Ticket size={24} />
                  </div>
                  <button 
                    onClick={() => toggleActive(coupon.id, coupon.is_active)}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      coupon.is_active ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                    )}
                    title={coupon.is_active ? "Disable" : "Enable"}
                  >
                    {coupon.is_active ? <Power size={18} /> : <PowerOff size={18} />}
                  </button>
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-wider font-mono">{coupon.code}</h3>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg mt-1">
                    {coupon.discount_type === 'percent' ? `${coupon.discount_value}% OFF` : `$${coupon.discount_value} OFF`}
                  </p>
                </div>

                <div className="space-y-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-500">Min. Purchase</span>
                    <span className="text-slate-900 dark:text-slate-100">${Number(coupon.min_purchase).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-500">Expires</span>
                    <span className={cn("text-slate-900 dark:text-slate-100", isExpired && "text-red-500")}>
                      {coupon.valid_until ? format(new Date(coupon.valid_until), 'MMM dd, yyyy') : 'Never'}
                    </span>
                  </div>
                </div>

                {isExpired && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border border-red-200">
                    Expired
                  </div>
                )}
              </div>
            );
          })}

          {coupons.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 font-bold">
              No coupons created yet.
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
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Create Coupon</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Coupon Code *</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-black text-lg uppercase outline-none font-mono" placeholder="SUMMER20" />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Type</label>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <button type="button" onClick={() => setDiscountType('percent')} className={cn("flex-1 py-2 font-bold text-sm rounded-lg transition-all", discountType === 'percent' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500")}>% OFF</button>
                      <button type="button" onClick={() => setDiscountType('fixed')} className={cn("flex-1 py-2 font-bold text-sm rounded-lg transition-all", discountType === 'fixed' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500")}>$ OFF</button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Value *</label>
                    <input type="number" step="0.01" min="0" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold outline-none" placeholder="10" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Min Purchase ($)</label>
                  <input type="number" step="0.01" min="0" value={minPurchase} onChange={e => setMinPurchase(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold outline-none" placeholder="0.00" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Expiration Date (Optional)</label>
                  <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold outline-none" />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-4 text-lg">{isSubmitting ? 'Saving...' : 'Save Coupon'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponsScreen;
