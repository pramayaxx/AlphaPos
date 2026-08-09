import React, { useState, useEffect } from 'react';
import { Truck, Plus, X, PackagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { api } from './App';
import { type Supplier, type Product } from './db';

const SuppliersScreen = ({ products }: { products: Product[] }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Supplier form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [address, setAddress] = useState('');

  // Purchase form
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res);
    } catch(err) {
      console.error(err);
    }
  };
  
  const fetchPurchases = async () => {
    try {
      const res = await api.get('/purchases');
      setPurchases(res);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchPurchases();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      await api.post('/suppliers', { name, phone, email, contact_person: contactPerson, address });
      fetchSuppliers();
      setShowAdd(false);
      setName(''); setPhone(''); setEmail(''); setContactPerson(''); setAddress('');
    } catch(err: any) {
      alert(err.message || 'Failed to add supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !selectedProduct || !quantity || !costPrice) return;
    setIsSubmitting(true);
    try {
      await api.post('/purchases', { 
        supplier_id: parseInt(selectedSupplier), 
        product_id: selectedProduct, 
        quantity: parseInt(quantity), 
        cost_price: parseFloat(costPrice) 
      });
      fetchPurchases();
      setShowPurchase(false);
      setSelectedSupplier(''); setSelectedProduct(''); setQuantity(''); setCostPrice('');
      alert("Stock updated successfully!");
    } catch(err: any) {
      alert(err.message || 'Failed to record purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex flex-wrap gap-4 justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Suppliers & Purchasing</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{suppliers.length} Suppliers</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowPurchase(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
          >
            <PackagePlus size={20} />
            <span className="hidden sm:inline">Receive Stock</span>
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Supplier</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4">Recent Stock Received</h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Date</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Product</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Supplier</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchases.map((p, i) => (
                  <tr key={p.id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{format(new Date(p.date_time), 'MMM dd, yyyy')}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{p.product_name || p.product_id}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">{p.supplier_name || '-'}</td>
                    <td className="p-4 font-black text-emerald-600 text-right">+{p.quantity}</td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">No purchase orders recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4">Supplier Directory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-slate-100 text-lg">{s.name}</h4>
                    {s.contact_person && <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{s.contact_person}</p>}
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-xl">
                    <Truck size={20} />
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {s.phone && <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{s.phone}</p>}
                  {s.email && <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{s.email}</p>}
                </div>
              </div>
            ))}
            {suppliers.length === 0 && (
              <div className="col-span-full p-8 text-center text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                No suppliers added yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Add Supplier</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddSupplier} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Company Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none" placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Contact Person</label>
                  <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none" placeholder="John Smith" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none" placeholder="+1 234..." />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-4">{isSubmitting ? 'Saving...' : 'Save Supplier'}</button>
              </form>
            </motion.div>
          </div>
        )}

        {showPurchase && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPurchase(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Receive Stock</h3>
                <button onClick={() => setShowPurchase(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddPurchase} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Supplier *</label>
                  <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none">
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Product *</label>
                  <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none">
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Quantity *</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="1" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Total Cost *</label>
                    <input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} required min="0" step="0.01" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl mt-4">{isSubmitting ? 'Saving...' : 'Confirm Stock In'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuppliersScreen;
