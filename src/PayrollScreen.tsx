import { api } from './api';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calculator, DollarSign, UserCheck, Check } from 'lucide-react';
import { type User } from './db';

const PayrollScreen = () => {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get('/payroll');
      setPayrolls(res);
      const stf = await api.get('/staff');
      setStaff(stf);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async () => {
    const staffId = window.prompt("Enter Staff ID to generate payroll (e.g. 1)");
    if (!staffId) return;
    const hours = window.prompt("Enter hours worked for period:");
    const comm = window.prompt("Enter commission earned:");
    if(!hours || !comm) return;
    
    try {
      await api.post('/payroll', {
        staff_id: parseInt(staffId),
        period_start: new Date(new Date().setDate(1)).toISOString(),
        period_end: new Date().toISOString(),
        hours_worked: parseFloat(hours),
        commission_earned: parseFloat(comm),
        total_payment: (parseFloat(hours) * 15) + parseFloat(comm), // assuming $15/hr base
        status: 'PAID'
      });
      fetchData();
    } catch(e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">HR & Payroll</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Manage Staff Salaries & Commissions</p>
        </div>
        <button 
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
        >
          <Calculator size={20} />
          Run Payroll
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Staff</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Period</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Hours</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Commission</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Total Payment</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payrolls.map((p, i) => (
                <tr key={p.id || i} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{p.staff_name || 'Staff #'+p.staff_id}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                    {format(new Date(p.period_start), 'MMM d')} - {format(new Date(p.period_end), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 font-bold text-blue-600 dark:text-blue-400">{p.hours_worked}h</td>
                  <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">${parseFloat(p.commission_earned).toFixed(2)}</td>
                  <td className="p-4 font-black text-slate-900 dark:text-slate-100 text-lg">${parseFloat(p.total_payment).toFixed(2)}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md text-xs font-bold uppercase">
                      <Check size={12} /> {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400 font-bold">No payroll records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollScreen;
