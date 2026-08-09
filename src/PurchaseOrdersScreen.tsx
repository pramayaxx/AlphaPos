import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, CheckCircle, PackageOpen } from 'lucide-react';
import { format } from 'date-fns';
import { api } from './App';
import { type PurchaseOrder, type Supplier, type Product } from './db';

const PurchaseOrdersScreen = ({ products }: { products: Product[] }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [items, setItems] = useState<{product_id: string, name: string, quantity: number, cost: number}[]>([]);
  const [notes, setNotes] = useState('');

  const fetchPos = async () => {
    try {
      const res = await api.get('/purchase-orders');
      setPos(res);
      const sups = await api.get('/suppliers');
      setSuppliers(sups);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPos();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { product_id: '', name: '', quantity: 1, cost: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    if (field === 'product_id') {
      const prod = products.find(p => p.id === value);
      updated[index].product_id = value;
      if (prod) {
        updated[index].name = prod.name;
        updated[index].cost = Number(prod.price) * 0.5; // Dummy cost
      }
    } else {
      (updated[index] as any)[field] = value;
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || items.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const totalAmount = items.reduce((sum, i) => sum + (i.quantity * i.cost), 0);
      await api.post('/purchase-orders', {
        po_number: 'PO-' + Date.now().toString().slice(-6),
        supplier_id: parseInt(selectedSupplier),
        expected_date: expectedDate || null,
        items,
        total_amount: totalAmount,
        notes
      });
      fetchPos();
      setShowAdd(false);
      setSelectedSupplier(''); setItems([]); setNotes(''); setExpectedDate('');
    } catch(err: any) {
      alert(err.message || 'Failed to create PO');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceive = async (id: string) => {
    if (!confirm('Mark PO as received and update stock?')) return;
    try {
      await api.put(`/purchase-orders/\${id}/receive`, {});
      fetchPos();
    } catch(err: any) {
      alert(err.message || 'Failed to receive PO');
    }
  };

  const filteredPos = pos.filter(p => 
    p.po_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Purchase Orders</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{pos.length} Orders</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          <Plus size={20} />
          Create PO
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
                placeholder="Search POs..." 
              />
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">PO Number</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Supplier</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Total</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Status</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPos.map((p, i) => (
                <tr key={p.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors">
                  <td className="p-4">
                    <div className="font-black text-slate-900 dark:text-slate-100">{p.po_number}</div>
                    <div className="text-xs font-bold text-slate-500">{format(new Date(p.order_date), 'MMM dd, yyyy')}</div>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{p.supplier_name}</td>
                  <td className="p-4 font-black text-slate-900 dark:text-slate-100">${Number(p.total_amount).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase \${p.status === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {p.status === 'pending' && (
                      <button 
                        onClick={() => handleReceive(p.id)}
                        className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ml-auto transition-colors"
                      >
                        <PackageOpen size={14} /> Receive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPos.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">No purchase orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2 shrink-0">
              <Truck size={24} className="text-blue-600" />
              Create Purchase Order
            </h3>
            
            <div className="flex-1 overflow-auto pr-2">
              <form id="po-form" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Supplier *</label>
                    <select 
                      value={selectedSupplier} 
                      onChange={e => setSelectedSupplier(e.target.value)} 
                      required 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none"
                    >
                      <option value="">Select Supplier...</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Expected Date</label>
                    <input 
                      type="date" 
                      value={expectedDate} 
                      onChange={e => setExpectedDate(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Order Items *</label>
                    <button type="button" onClick={handleAddItem} className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">
                      <Plus size={16} /> Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex-1">
                          <select 
                            value={item.product_id}
                            onChange={e => updateItem(idx, 'product_id', e.target.value)}
                            required
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-medium outline-none text-sm"
                          >
                            <option value="">Select Product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="w-24">
                          <input 
                            type="number" min="1" placeholder="Qty" value={item.quantity}
                            onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))} required
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-medium outline-none text-sm"
                          />
                        </div>
                        <div className="w-32">
                          <input 
                            type="number" min="0" step="0.01" placeholder="Cost" value={item.cost}
                            onChange={e => updateItem(idx, 'cost', parseFloat(e.target.value))} required
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-medium outline-none text-sm"
                          />
                        </div>
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg mt-0.5">
                          X
                        </button>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-4 text-slate-500 text-sm font-bold border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        No items added. Click "Add Item" to start.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Notes</label>
                  <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none" 
                    placeholder="Optional notes..." 
                  />
                </div>
              </form>
            </div>

            <div className="pt-4 shrink-0 border-t border-slate-100 dark:border-slate-800 mt-4 flex gap-4">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-xl text-lg transition-colors">
                Cancel
              </button>
              <button type="submit" form="po-form" disabled={isSubmitting || items.length === 0} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Create PO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersScreen;
