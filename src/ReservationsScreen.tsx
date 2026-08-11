import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Calendar, User, Phone, Check, Clock, Users, Plus } from 'lucide-react';
import { useTranslation } from './i18n';

export const ReservationsScreen = ({ tables }: { tables: any[] }) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const { t } = useTranslation();

  const [form, setForm] = useState({
    table_id: '',
    customer_name: '',
    customer_phone: '',
    reservation_time: '',
    guest_count: 2
  });

  const load = () => {
    api.get('/reservations').then(setReservations).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/reservations', form);
      setShowAdd(false);
      load();
    } catch (err) { alert('Failed to create reservation'); }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('reservations' as any)}</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Plus size={20} /> New Reservation
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Reservation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input required className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input required className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600" value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Table</label>
                <select required className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600" value={form.table_id} onChange={e => setForm({...form, table_id: e.target.value})}>
                  <option value="">Select Table</option>
                  {tables?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input required type="datetime-local" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600" value={form.reservation_time} onChange={e => setForm({...form, reservation_time: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Guests</label>
                <input required type="number" min="1" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600" value={form.guest_count} onChange={e => setForm({...form, guest_count: parseInt(e.target.value)})} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reservations.map(r => (
          <div key={r.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{r.customer_name}</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">{r.status}</span>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p className="flex items-center gap-2"><Phone size={16} /> {r.customer_phone}</p>
              <p className="flex items-center gap-2"><Calendar size={16} /> {new Date(r.reservation_time).toLocaleString()}</p>
              <p className="flex items-center gap-2"><Users size={16} /> {r.guest_count} Guests (Table #{r.table_id})</p>
            </div>
          </div>
        ))}
        {reservations.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">No reservations found.</div>
        )}
      </div>
    </div>
  );
};
