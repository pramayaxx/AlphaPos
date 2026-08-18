import { api } from './api';
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, TrendingUp, CreditCard, Ban, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const SuperAdminScreen = ({ onLogout }: { onLogout: () => void }) => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, revenue: 0 });

  const fetchData = async () => {
    try {
      const t = await api.get('/superadmin/tenants');
      setTenants(t);
      const s = await api.get('/superadmin/stats');
      setStats(s);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const changeStatus = async (id: number, status: string) => {
    if (!confirm(`Are you sure you want to change status to ${status}?`)) return;
    try {
      await api.post(`/superadmin/tenants/${id}/status`, { status });
      fetchData();
    } catch(err: any) { alert(err.message); }
  };

  const changePackage = async (id: number, package_type: string) => {
    try {
      await api.post(`/superadmin/tenants/${id}/package`, { package_type });
      fetchData();
    } catch(err: any) { alert(err.message); }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 min-h-[100dvh]">
      <div className="bg-slate-950 px-8 py-6 border-b border-slate-800 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-red-500" size={32} />
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Super Admin Control Panel</h2>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">Global System Management</p>
          </div>
        </div>
        <button onClick={onLogout} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl font-bold">Logout</button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 flex items-center gap-4">
              <div className="bg-blue-500/20 p-4 rounded-2xl text-blue-400"><Users size={32} /></div>
              <div>
                <div className="text-slate-400 font-bold text-sm uppercase tracking-wider">Total Shops</div>
                <div className="text-3xl font-black text-white">{stats.total}</div>
              </div>
           </div>
           <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 flex items-center gap-4">
              <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-400"><CheckCircle size={32} /></div>
              <div>
                <div className="text-slate-400 font-bold text-sm uppercase tracking-wider">Active Shops</div>
                <div className="text-3xl font-black text-white">{stats.active}</div>
              </div>
           </div>
           <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 flex items-center gap-4">
              <div className="bg-amber-500/20 p-4 rounded-2xl text-amber-400"><TrendingUp size={32} /></div>
              <div>
                <div className="text-slate-400 font-bold text-sm uppercase tracking-wider">Est. Monthly Rev</div>
                <div className="text-3xl font-black text-white">${stats.revenue}</div>
              </div>
           </div>
        </div>

        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
           <div className="p-6 border-b border-slate-700">
             <h3 className="text-xl font-black text-white">Registered Tenants (Shops)</h3>
           </div>
           <table className="w-full text-left text-slate-300">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700 font-bold text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4">Tenant Email</th>
                <th className="p-4">Owner Name</th>
                <th className="p-4">Package</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} className="border-b border-slate-700 hover:bg-slate-750">
                  <td className="p-4 font-bold">{t.email}</td>
                  <td className="p-4">{t.full_name}</td>
                  <td className="p-4">
                    <select value={t.package_type} onChange={e => changePackage(t.id, e.target.value)} className="bg-slate-900 border border-slate-700 p-2 rounded-lg font-bold text-sm">
                      <option value="BASIC">BASIC</option>
                      <option value="PRO">PRO</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${t.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {t.status === 'ACTIVE' ? (
                      <button onClick={() => changeStatus(t.id, 'SUSPENDED')} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                        <Ban size={16} /> Suspend
                      </button>
                    ) : (
                      <button onClick={() => changeStatus(t.id, 'ACTIVE')} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                        <CheckCircle size={16} /> Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
export default SuperAdminScreen;
