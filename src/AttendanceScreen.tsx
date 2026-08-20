import React, { useState, useEffect } from 'react';
import { Clock, Plus, X, UserCheck, Play, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInMinutes, differenceInHours } from 'date-fns';
import { api } from './api';
import { User } from './db';
import { type AttendanceRecord } from './db';
import { cn } from './lib/utils';

const AttendanceScreen = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedStaff, setSelectedStaff] = useState('');

  const fetchData = async () => {
    try {
      const recs = await api.get('/attendance');
      setRecords(recs);
      const stf = await api.get('/staff').catch(() => []);
      setStaff(stf);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);
    
    const staffMember = staff.find(s => s.id?.toString() === selectedStaff);
    
    try {
      await api.post('/attendance/clock-in', { 
        staff_id: parseInt(selectedStaff),
        staff_name: staffMember?.fullName || 'Unknown'
      });
      fetchData();
      setShowAdd(false);
      setSelectedStaff('');
    } catch(err: any) {
      alert(err.message || 'Failed to clock in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async (id: string) => {
    if (!confirm('Are you sure you want to clock out?')) return;
    try {
      await api.post(`/attendance/${id}/clock-out`, {});
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to clock out');
    }
  };

  const calculateDuration = (inTime: string, outTime?: string) => {
    if (!outTime) return 'Working now';
    const mins = differenceInMinutes(new Date(outTime), new Date(inTime));
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Time Clock</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{records.filter(r => !r.clock_out).length} currently working</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
        >
          <Play size={20} />
          Clock In
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Staff Member</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Date</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Clock In</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Clock Out</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Duration</th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                      {r.staff_name.charAt(0).toUpperCase()}
                    </div>
                    {r.staff_name}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{format(new Date(r.clock_in), 'MMM dd, yyyy')}</td>
                  <td className="p-4 text-emerald-600 font-bold">{format(new Date(r.clock_in), 'hh:mm a')}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-bold">
                    {r.clock_out ? format(new Date(r.clock_out), 'hh:mm a') : '-'}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                    {calculateDuration(r.clock_in, r.clock_out)}
                  </td>
                  <td className="p-4 text-right">
                    {!r.clock_out && (
                      <button 
                        onClick={() => handleClockOut(r.id)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ml-auto"
                      >
                        <Square size={14} />
                        Clock Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400 font-bold">No time clock records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Clock In</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400"><X size={20} /></button>
              </div>
              
              {staff.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 font-bold">
                  No staff members available. Go to the Staff tab to add them first.
                </div>
              ) : (
                <form onSubmit={handleClockIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Select Staff Member *</label>
                    <select 
                      value={selectedStaff} 
                      onChange={e => setSelectedStaff(e.target.value)} 
                      required 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium outline-none"
                    >
                      <option value="">Select...</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.fullName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl mt-4 text-lg">
                    {isSubmitting ? 'Clocking In...' : 'Confirm Clock In'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceScreen;
