import { api } from './api';
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const ShiftsScreen = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [startingCash, setStartingCash] = useState(0);
  const [endingCash, setEndingCash] = useState(0);

  const safeFormatDate = (dateVal: any, fmt: string) => {
    try {
      if (!dateVal) return '-';
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '-';
      return format(d, fmt);
    } catch (e) {
      return '-';
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts');
      const shiftList = Array.isArray(res) ? res : [];
      setShifts(shiftList);
      const active = shiftList.find((s: any) => String(s.status).toUpperCase() === 'OPEN');
      setActiveShift(active || null);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchShifts(); }, []);

  const openShift = async () => {
    try {
      await api.post('/shifts/open', { 
        starting_cash: startingCash, 
        opening_balance: startingCash,
        staff_id: 1 
      });
      fetchShifts();
    } catch(err: any) { alert(err.message || 'Failed to open shift'); }
  };

  const closeShift = async () => {
    if (!activeShift) return;
    try {
      await api.post(`/shifts/${activeShift.id}/close`, { 
        ending_cash: endingCash, 
        closing_balance: endingCash,
        expected_cash: activeShift.starting_cash || activeShift.opening_balance || 0,
        expected_balance: activeShift.starting_cash || activeShift.opening_balance || 0
      });
      fetchShifts();
    } catch(err: any) { alert(err.message || 'Failed to close shift'); }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
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
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle size={20} /> Shift is OPEN
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Opened At</label>
                <div className="font-medium text-lg">{safeFormatDate(activeShift.start_time || activeShift.opened_at, 'hh:mm a')}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Starting Cash</label>
                <div className="font-medium text-lg">Rs. {Number(activeShift.starting_cash || activeShift.opening_balance || 0).toLocaleString()}</div>
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Count Drawer to Close (Ending Cash)</label>
                <input type="number" step="0.01" value={endingCash} onChange={e=>setEndingCash(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-4" />
                <button onClick={closeShift} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                  <XCircle size={18} /> Close Shift &amp; Print Z-Report
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-bold flex items-center gap-2">
                <Clock size={20} /> No active shift
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Starting Cash (Float)</label>
                <input type="number" step="0.01" value={startingCash} onChange={e=>setStartingCash(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-4" />
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
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
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
                const isClosed = String(s.status).toUpperCase() === 'CLOSED';
                const startCash = Number(s.starting_cash || s.opening_balance || 0);
                const endCash = Number(s.ending_cash || s.closing_balance || 0);
                const expCash = Number(s.expected_cash || s.expected_balance || startCash);
                const variance = isClosed ? (endCash - expCash) : 0;
                return (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 dark:bg-slate-800">
                  <td className="p-4 font-bold">{safeFormatDate(s.start_time || s.opened_at, 'MMM d, yyyy')}</td>
                  <td className="p-4 text-sm">
                    <div>{safeFormatDate(s.start_time || s.opened_at, 'hh:mm a')}</div>
                    {isClosed && <div className="text-slate-400">{safeFormatDate(s.end_time || s.closed_at, 'hh:mm a')}</div>}
                  </td>
                  <td className="p-4 font-bold">Rs. {startCash.toLocaleString()}</td>
                  <td className="p-4 font-bold">
                    {isClosed ? (
                      <div>
                        <span className="text-slate-400 text-xs">Exp: Rs. {expCash.toLocaleString()}</span>
                        <div>Act: Rs. {endCash.toLocaleString()}</div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className={`p-4 font-bold ${variance < 0 ? 'text-red-500' : (variance > 0 ? 'text-emerald-500' : 'text-slate-500')}`}>
                    {isClosed ? (variance >= 0 ? `+Rs. ${variance.toLocaleString()}` : `-Rs. ${Math.abs(variance).toLocaleString()}`) : '-'}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${isClosed ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
export default ShiftsScreen;
