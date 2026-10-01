import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, CheckCircle, XCircle, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { api } from './api';
import { User } from './db';
import { type Quote, type Customer } from './db';

const QuotesScreen = ({ customers }: { customers: Customer[] }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQuotes = async () => {
    try {
      const res = await api.get('/quotes');
      setQuotes(res);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/quotes/${id}/status`, { status });
      fetchQuotes();
    } catch(err) {
      console.error(err);
    }
  };

  const filteredQuotes = (quotes || []).filter(q => 
    (q.uuid || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (q.customer_id && (customers || []).find(c => String(c.id) === String(q.customer_id))?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Estimates & Quotes</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{quotes.length} Total</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 font-medium outline-none" 
            placeholder="Search quotes..." 
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Quote ID / Date</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Customer</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Total</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Status</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuotes.map((q, i) => {
                const cust = (customers || []).find(c => String(c.id) === String(q.customer_id));
                return (
                  <tr key={q.id || i} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-slate-900 dark:text-slate-100">{q.uuid}</div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {q.date_time ? format(new Date(q.date_time), 'MMM dd, yyyy HH:mm') : '-'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {cust ? cust.name : <span className="text-slate-400 italic">Walk-in</span>}
                    </td>
                    <td className="p-4 font-black text-slate-900 dark:text-slate-100">
                      Rs. {Number(q.grand_total || 0).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                        q.status === 'accepted' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        q.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        q.status === 'invoiced' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      {q.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(q.id, 'accepted')} className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors" title="Accept"><CheckCircle size={18} /></button>
                          <button onClick={() => updateStatus(q.id, 'rejected')} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors" title="Reject"><XCircle size={18} /></button>
                        </>
                      )}
                      <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-lg transition-colors" title="Print/View"><Printer size={18} /></button>
                    </td>
                  </tr>
                )
              })}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400 font-bold">No quotes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotesScreen;
