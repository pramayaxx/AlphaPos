import { api } from './api';
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const ShiftsScreen = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [startingCash, setStartingCash] = useState(0);
  const [endingCash, setEndingCash] = useState(0);

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts');
      setShifts(res);
      const active = res.find((s: any) => s.status === 'OPEN');
      setActiveShift(active || null);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchShifts(); }, []);

  const openShift = async () => {
    try {
      await api.post('/shifts/open', { starting_cash: startingCash, staff_id: 1 });
      fetchShifts();
    } catch(err: any) { alert(err.message); }
  };

  const closeShift = async () => {
    try {
      // expected cash is just starting cash for this simple example. In reality it would be starting_cash + cash_sales - cash_refunds
      await api.post(`/shifts/close/${activeShift.id}`, { ending_cash: endingCash, expected_cash: activeShift.starting_cash });
      fetchShifts();
    } catch(err: any) { alert(err.message); }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Shift Management</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Drawer & Z-Reports</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 h-fit">
          <h3 className="text-xl font-black mb-6">Current Shift</h3>
          {activeShift ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle size={20} /> Shift is OPEN
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Opened At</label>
                <div className="font-medium text-lg">{format(new Date(activeShift.start_time), 'hh:mm a')}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Starting Cash</label>
                <div className="font-medium text-lg">${activeShift.starting_cash.toFixed(2)}</div>
              </div>
              
              <div className="border-t border-slate-200 pt-4 mt-4">
                <label className="block text-xs font-bold text-slate-500 mb-2">Count Drawer to Close (Ending Cash)</label>
                <input type="number" step="0.01" value={endingCash} onChange={e=>setEndingCash(parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-4" />
                <button onClick={closeShift} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                  <XCircle size={18} /> Close Shift & Print Z-Report
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 text-slate-500 rounded-xl font-bold flex items-center gap-2">
                <Clock size={20} /> No active shift
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Starting Cash (Float)</label>
                <input type="number" step="0.01" value={startingCash} onChange={e=>setStartingCash(parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-4" />
                <button onClick={openShift} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Open Shift
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
           <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="p-4">Date</th>
                <th className="p-4">Opened / Closed</th>
                <th className="p-4">Starting</th>
                <th className="p-4">Expected / Ending</th>
                <th className="p-4">Variance</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map(s => {
                const isClosed = s.status === 'CLOSED';
                const variance = isClosed ? (s.ending_cash - s.expected_cash) : 0;
                return (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-4 font-bold">{format(new Date(s.start_time), 'MMM d, yyyy')}</td>
                  <td className="p-4 text-sm">
                    <div>{format(new Date(s.start_time), 'hh:mm a')}</div>
                    {isClosed && <div className="text-slate-400">{format(new Date(s.end_time), 'hh:mm a')}</div>}
                  </td>
                  <td className="p-4 font-bold">${s.starting_cash.toFixed(2)}</td>
                  <td className="p-4 font-bold">
                    {isClosed ? (
                      <div>
                         <span className="text-slate-400">${s.expected_cash.toFixed(2)}</span> / <span className="text-blue-600">${s.ending_cash.toFixed(2)}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="p-4 font-bold">
                     {isClosed ? (
                        <span className={variance < 0 ? 'text-red-500' : variance > 0 ? 'text-emerald-500' : 'text-slate-400'}>
                          {variance > 0 ? '+' : ''}{variance.toFixed(2)}
                        </span>
                     ) : '-'}
                  </td>
                  <td className="p-4 font-bold text-sm">
                    {s.status === 'OPEN' ? <span className="text-emerald-600">OPEN</span> : <span className="text-slate-500">CLOSED</span>}
                  </td>
                </tr>
              )})}
            </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
export default ShiftsScreen;
