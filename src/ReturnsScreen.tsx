import React, { useState, useEffect } from 'react';
import { RotateCcw, Search, CheckCircle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { api } from './App';
import { type Return, type Bill } from './db';

const ReturnsScreen = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Return Form
  const [selectedBillId, setSelectedBillId] = useState('');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [reason, setReason] = useState('');
  const [restock, setRestock] = useState(true);

  const fetchData = async () => {
    try {
      const rets = await api.get('/returns');
      setReturns(rets);
      const bils = await api.get('/bills');
      setBills(bils);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectBill = (id: string) => {
    setSelectedBillId(id);
    const bill = bills.find(b => b.id?.toString() === id);
    if (bill && bill.items) {
      setSelectedItems(bill.items.map(i => ({ ...i, return_quantity: 0 })));
    } else {
      setSelectedItems([]);
    }
  };

  const handleQuantityChange = (idx: number, qty: number) => {
    const updated = [...selectedItems];
    updated[idx].return_quantity = Math.min(updated[idx].quantity, Math.max(0, qty));
    setSelectedItems(updated);
  };

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToReturn = selectedItems.filter(i => i.return_quantity > 0);
    if (itemsToReturn.length === 0) {
      alert("Select at least one item to return.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const refundAmount = itemsToReturn.reduce((sum, item) => {
         const itemTotal = Number(item.price) * item.return_quantity;
         const tax = item.tax_rate ? (itemTotal * Number(item.tax_rate) / 100) : 0;
         return sum + itemTotal + tax;
      }, 0);

      const itemsForPayload = itemsToReturn.map(i => ({
         product_id: i.product_id,
         name: i.name,
         price: i.price,
         quantity: i.return_quantity
      }));

      await api.post('/returns', {
        bill_id: selectedBillId,
        items: itemsForPayload,
        refund_amount: refundAmount,
        reason,
        restock
      });
      
      fetchData();
      setShowAdd(false);
      setSelectedBillId('');
      setSelectedItems([]);
      setReason('');
    } catch(err: any) {
      alert(err.message || "Failed to process return");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReturns = returns.filter(r => 
    r.original_bill_uuid?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Returns & Refunds</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{returns.length} Total Returns</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/30 flex items-center gap-2"
        >
          <RotateCcw size={20} />
          Process Return
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 font-medium outline-none" 
                placeholder="Search returns..." 
              />
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Date</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Original Receipt</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Refund Amount</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReturns.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{format(new Date(r.return_date), 'MMM dd, yyyy HH:mm')}</td>
                  <td className="p-4 text-blue-600 dark:text-blue-400 font-bold font-mono">
                    {r.original_bill_uuid ? r.original_bill_uuid.split('-')[0] : 'Unknown'}
                  </td>
                  <td className="p-4 text-red-600 font-black">
                    -${Number(r.refund_amount).toFixed(2)}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                    {r.reason}
                  </td>
                </tr>
              ))}
              {filteredReturns.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-bold">No returns processed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2 shrink-0">
              <RotateCcw size={24} className="text-red-500" />
              Process New Return
            </h3>
            
            <div className="flex-1 overflow-auto pr-2">
              <form id="return-form" onSubmit={handleProcessReturn} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Select Original Receipt *</label>
                  <select 
                    value={selectedBillId} 
                    onChange={e => handleSelectBill(e.target.value)} 
                    required 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none"
                  >
                    <option value="">Select Receipt...</option>
                    {bills.map(b => (
                      <option key={b.id} value={b.id}>{b.uuid.split('-')[0]} - {format(new Date(b.date_time), 'MMM dd, HH:mm')} - ${Number(b.grand_total).toFixed(2)}</option>
                    ))}
                  </select>
                </div>

                {selectedItems.length > 0 && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 text-xs font-black text-slate-500 uppercase tracking-wider flex">
                      <div className="flex-1">Item</div>
                      <div className="w-24 text-center">Purchased</div>
                      <div className="w-24 text-center">Return Qty</div>
                    </div>
                    {selectedItems.map((item, idx) => (
                      <div key={idx} className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center bg-white dark:bg-slate-900">
                        <div className="flex-1 font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
                        <div className="w-24 text-center text-slate-500 font-medium">{item.quantity}</div>
                        <div className="w-24">
                          <input 
                            type="number" 
                            min="0" 
                            max={item.quantity} 
                            value={item.return_quantity} 
                            onChange={e => handleQuantityChange(idx, parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-bold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Reason for Return</label>
                  <input 
                    type="text" 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none" 
                    placeholder="e.g. Defective, Changed mind" 
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input 
                    type="checkbox" 
                    id="restock" 
                    checked={restock} 
                    onChange={e => setRestock(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="restock" className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                    <Package size={18} />
                    Restock items to inventory
                  </label>
                </div>
              </form>
            </div>

            <div className="pt-4 shrink-0 border-t border-slate-100 dark:border-slate-800 mt-4 flex gap-4">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-xl text-lg transition-colors">
                Cancel
              </button>
              <button type="submit" form="return-form" disabled={isSubmitting || selectedItems.filter(i => i.return_quantity > 0).length === 0} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-50">
                {isSubmitting ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsScreen;
