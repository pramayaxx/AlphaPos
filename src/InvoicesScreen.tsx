import { api } from './api';
import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const InvoicesScreen = () => {
  const [invoices, setInvoices] = useState<any[]>([]);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const safeDate = (dateVal: any) => {
    try {
      if (!dateVal) return '-';
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '-';
      return format(d, 'MMM d, yyyy');
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Accounts Receivable</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">B2B Monthly Billing & Invoices</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
           <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="p-4">Inv #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Created</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const isPaid = inv.status === 'PAID';
                return (
                <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 dark:bg-slate-800">
                  <td className="p-4 font-bold text-blue-600 dark:text-blue-400">INV-{inv.id.toString().padStart(4, '0')}</td>
                  <td className="p-4 font-bold">{inv.customer_name || 'Customer'}</td>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{safeDate(inv.created_at)}</td>
                  <td className="p-4 font-bold text-red-500">{safeDate(inv.due_date)}</td>
                  <td className="p-4 font-black text-lg">Rs. {Number(inv.amount || 0).toLocaleString()}</td>
                  <td className="p-4 font-bold text-sm">
                    {isPaid ? <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">PAID</span> : <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">UNPAID</span>}
                  </td>
                </tr>
              )})}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 dark:text-slate-400 font-bold">No invoices generated yet. Generate an invoice from Checkout for B2B clients.</td>
                </tr>
              )}
            </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
export default InvoicesScreen;
