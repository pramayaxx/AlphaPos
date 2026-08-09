import React, { useState, useRef } from 'react';
import Barcode from 'react-barcode';
import { type Product } from './db';
import { Printer, Check, X, Search, Plus, Minus } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const BarcodeScreen = ({ products }: { products: Product[] }) => {
  const [selectedProducts, setSelectedProducts] = useState<{product: Product, quantity: number}[]>([]);
  const [search, setSearch] = useState('');
  const printRef = useRef(null);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.item_number && p.item_number.includes(search))
  );

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const addProduct = (p: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(i => i.product.id === p.id);
      if (exists) {
        return prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedProducts(prev => prev.map(i => {
      if (i.product.id === id) {
        const newQ = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQ };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Barcode Labels</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Generate & Print Barcodes</p>
        </div>
        <button 
          onClick={handlePrint}
          disabled={selectedProducts.length === 0}
          className="bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          <Printer size={20} />
          Print Labels
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 flex gap-8">
        <div className="w-1/3 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-12 pr-4 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => addProduct(p)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl text-left transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.item_number}</div>
                  </div>
                  <Plus size={18} className="text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Selected for Printing</h3>
          
          <div className="flex-1 overflow-auto space-y-3 mb-6">
            {selectedProducts.map(item => (
              <div key={item.product.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{item.product.name}</div>
                  <div className="text-xs text-slate-500">{item.product.item_number}</div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button onClick={() => updateQuantity(item.product.id as string, -1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"><Minus size={16} /></button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id as string, 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"><Plus size={16} /></button>
                </div>
              </div>
            ))}
            {selectedProducts.length === 0 && (
              <div className="text-center py-10 text-slate-400 font-bold">
                Select products from the left to generate barcodes.
              </div>
            )}
          </div>

          {/* Hidden print container */}
          <div className="hidden">
            <div ref={printRef} className="p-8 grid grid-cols-3 gap-6" style={{ width: '100%', '@page': { size: 'A4', margin: '1cm' } }}>
              {selectedProducts.flatMap(item => 
                Array(item.quantity).fill(item.product).map((prod, idx) => (
                  <div key={`${prod.id}-${idx}`} className="flex flex-col items-center justify-center border border-dashed border-gray-300 p-4 text-center">
                    <div className="font-bold text-sm mb-1 line-clamp-1">{prod.name}</div>
                    {prod.item_number ? (
                      <Barcode value={prod.item_number} width={1.5} height={40} fontSize={12} displayValue={true} />
                    ) : (
                      <div className="text-xs text-gray-400 italic py-4">No barcode</div>
                    )}
                    <div className="font-black text-lg mt-1">${(prod.price || 0).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BarcodeScreen;
