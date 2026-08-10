import { api } from './api';
import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Save } from 'lucide-react';
import { type Product } from './db';

const RecipesScreen = ({ products }: { products: Product[] }) => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [newRecipe, setNewRecipe] = useState({ product_id: '', raw_material_product_id: '', quantity_needed: 1 });

  const fetchRecipes = async () => {
    try {
      const res = await api.get('/recipes');
      setRecipes(res);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchRecipes(); }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/recipes', {
        product_id: parseInt(newRecipe.product_id),
        raw_material_product_id: parseInt(newRecipe.raw_material_product_id),
        quantity_needed: parseFloat(newRecipe.quantity_needed.toString())
      });
      fetchRecipes();
      setNewRecipe({ product_id: '', raw_material_product_id: '', quantity_needed: 1 });
    } catch(err: any) { alert(err.message); }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Recipes & BOM</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Raw Material Deductions (Bill of Materials)</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 h-fit">
          <h3 className="text-xl font-black mb-6">Add Recipe Ingredient</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Finished Product (e.g. Fried Rice)</label>
              <select required value={newRecipe.product_id} onChange={e=>setNewRecipe({...newRecipe, product_id: e.target.value})} className="w-full bg-slate-50 rounded-xl p-3">
                <option value="">- Select -</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Raw Material (e.g. Rice 1kg)</label>
              <select required value={newRecipe.raw_material_product_id} onChange={e=>setNewRecipe({...newRecipe, raw_material_product_id: e.target.value})} className="w-full bg-slate-50 rounded-xl p-3">
                <option value="">- Select -</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Qty to Deduct (per 1 sale)</label>
              <input required type="number" step="0.001" value={newRecipe.quantity_needed} onChange={e=>setNewRecipe({...newRecipe, quantity_needed: e.target.value})} className="w-full bg-slate-50 rounded-xl p-3" />
            </div>
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4">
              <Plus size={18} /> Add to Recipe
            </button>
          </form>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
           <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="p-4">Finished Product</th>
                <th className="p-4">Raw Material</th>
                <th className="p-4">Qty Deducted</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-4 font-black text-slate-900 flex items-center gap-2"><Utensils size={16} className="text-emerald-500"/> {r.product_name}</td>
                  <td className="p-4 font-bold text-slate-700">{r.raw_material_name}</td>
                  <td className="p-4 font-black text-red-500">-{r.quantity_needed}</td>
                </tr>
              ))}
              {recipes.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-slate-500 font-bold">No recipes defined.</td>
                </tr>
              )}
            </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
export default RecipesScreen;
