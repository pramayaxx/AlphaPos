import { api } from './api';
import React, { useState, useEffect } from 'react';
import { Layers, Plus, Save } from 'lucide-react';
import { type Product } from './db';

const VariantsScreen = ({ products }: { products: Product[] }) => {
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [newVariant, setNewVariant] = useState({ name: '', sku: '', price: '', stock_quantity: 0 });

  const fetchVariants = async (productId: string) => {
    if(!productId) return;
    try {
      const res = await api.get(`/variants/${productId}`);
      setVariants(res);
    } catch(err) { console.error(err); }
  };

  useEffect(() => {
    fetchVariants(selectedProduct);
  }, [selectedProduct]);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await api.post('/variants', {
        product_id: parseInt(selectedProduct),
        name: newVariant.name,
        sku: newVariant.sku,
        price: newVariant.price ? parseFloat(newVariant.price) : null,
        stock_quantity: newVariant.stock_quantity
      });
      fetchVariants(selectedProduct);
      setNewVariant({ name: '', sku: '', price: '', stock_quantity: 0 });
    } catch(err: any) { alert(err.message); }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Product Variants</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Manage Sizes, Colors & Editions</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 flex gap-8">
        <div className="w-1/3 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 h-fit">
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Select Base Product</label>
          <select 
            value={selectedProduct} 
            onChange={e => setSelectedProduct(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-6"
          >
            <option value="">-- Choose a product --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.item_number})</option>
            ))}
          </select>

          {selectedProduct && (
            <form onSubmit={handleAdd} className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h3 className="font-black">Add New Variant</h3>
              <input required type="text" placeholder="Variant Name (e.g. Size L, Red)" value={newVariant.name} onChange={e=>setNewVariant({...newVariant, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3" />
              <input type="text" placeholder="SKU (Optional)" value={newVariant.sku} onChange={e=>setNewVariant({...newVariant, sku: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3" />
              <input type="number" step="0.01" placeholder="Override Price (Optional)" value={newVariant.price} onChange={e=>setNewVariant({...newVariant, price: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3" />
              <input required type="number" placeholder="Initial Stock" value={newVariant.stock_quantity} onChange={e=>setNewVariant({...newVariant, stock_quantity: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3" />
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                <Plus size={18} /> Add Variant
              </button>
            </form>
          )}
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
          <h3 className="font-black text-xl mb-6">Existing Variants</h3>
          {variants.length === 0 ? (
            <div className="text-center p-12 text-slate-500 font-bold">
              {selectedProduct ? 'No variants found for this product.' : 'Select a product first.'}
            </div>
          ) : (
            <div className="space-y-3">
              {variants.map(v => (
                <div key={v.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <Layers size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{v.name}</div>
                      <div className="text-sm text-slate-500 flex gap-4">
                        <span>SKU: {v.sku || 'N/A'}</span>
                        <span>Stock: {v.stock_quantity}</span>
                      </div>
                    </div>
                  </div>
                  {v.price && <div className="font-black text-emerald-600">${v.price}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default VariantsScreen;
