import { api } from './api';
import React, { useState, useEffect } from 'react';
import { Store, Receipt, Users, CreditCard, ShieldCheck } from 'lucide-react';


const ShopSettingsScreen = ({ currentUser, settings, setSettings, onPrinterSetup }: any) => {
  const [activeTab, setActiveTab] = useState<'general' | 'receipt' | 'staff' | 'billing'>('general');
  const [localSettings, setLocalSettings] = useState<any>(settings || { name: '', phone: '', address: '', receiptFooter: '' });
  const [staff, setStaff] = useState<any[]>([]);
  const [newStaff, setNewStaff] = useState({ full_name: '', phone: '', role: 'CASHIER', pin: '' });

  useEffect(() => {
    api.get('/staff').then(res => setStaff(res)).catch(e => console.error(e));
    api.get('/shop-settings').then(res => {
        if(res) {
           setLocalSettings(res);
           setSettings(res);
        }
    }).catch(e => console.error(e));
  }, []);

  const saveSettings = async () => {
    try {
      const res = await api.post('/shop-settings', localSettings);
      setSettings(res);
      alert('Settings saved!');
    } catch(err: any) { alert(err.message); }
  };

  const addStaff = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/staff', newStaff);
      const res = await api.get('/staff');
      setStaff(res);
      setNewStaff({ full_name: '', phone: '', role: 'CASHIER', pin: '' });
    } catch(err: any) { alert(err.message); }
  };

  const deleteStaff = async (id: number) => {
    if(!confirm("Delete this staff member?")) return;
    try {
      await api.delete(`/staff/${id}`);
      setStaff(staff.filter(s => s.id !== id));
    } catch(err: any) { alert(err.message); }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Shop Settings</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{currentUser?.package_type} PACKAGE</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
           <button onClick={() => setActiveTab('general')} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${activeTab === 'general' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><Store size={20}/> General</button>
           <button onClick={() => setActiveTab('receipt')} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${activeTab === 'receipt' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><Receipt size={20}/> Receipt config</button>
           <button onClick={() => setActiveTab('staff')} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${activeTab === 'staff' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><Users size={20}/> Staff & Roles</button>
           <button onClick={() => setActiveTab('billing')} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 ${activeTab === 'billing' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}><CreditCard size={20}/> SaaS Billing</button>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 h-fit">
           {activeTab === 'general' && (
             <div className="space-y-6 max-w-xl">
               <h3 className="text-xl font-black mb-4">General Settings</h3>
               <div><label className="block text-xs font-bold text-slate-500 mb-2">Store Name</label><input type="text" value={localSettings.name || ''} onChange={e=>setLocalSettings({...localSettings, name: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl" /></div>
               <div><label className="block text-xs font-bold text-slate-500 mb-2">Phone</label><input type="text" value={localSettings.phone || ''} onChange={e=>setLocalSettings({...localSettings, phone: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl" /></div>
               <div><label className="block text-xs font-bold text-slate-500 mb-2">Address</label><textarea value={localSettings.address || ''} onChange={e=>setLocalSettings({...localSettings, address: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl" /></div>
               <button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl">Save Changes</button>
             </div>
           )}

           {activeTab === 'receipt' && (
             <div className="space-y-6 max-w-xl">
               <h3 className="text-xl font-black mb-4">Receipt Configuration</h3>
               <div><label className="block text-xs font-bold text-slate-500 mb-2">Footer Message (e.g. Thank you, come again!)</label><textarea value={localSettings.receiptFooter || ''} onChange={e=>setLocalSettings({...localSettings, receiptFooter: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl" /></div>
               <button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl mt-4">Save Receipt Settings</button>
               <hr className="my-8" />
               <button onClick={onPrinterSetup} className="bg-slate-100 text-slate-900 font-bold py-3 px-6 rounded-xl w-full text-center">Configure Printer</button>
             </div>
           )}

           {activeTab === 'staff' && (
             <div>
               <h3 className="text-xl font-black mb-4">Staff & Roles</h3>
               <div className="bg-slate-50 p-6 rounded-2xl mb-8">
                 <h4 className="font-bold mb-4">Add Staff Member</h4>
                 <form onSubmit={addStaff} className="grid grid-cols-2 gap-4">
                   <input required placeholder="Full Name" value={newStaff.full_name} onChange={e=>setNewStaff({...newStaff, full_name: e.target.value})} className="bg-white p-3 rounded-xl" />
                   <input placeholder="Phone" value={newStaff.phone} onChange={e=>setNewStaff({...newStaff, phone: e.target.value})} className="bg-white p-3 rounded-xl" />
                   <select value={newStaff.role} onChange={e=>setNewStaff({...newStaff, role: e.target.value})} className="bg-white p-3 rounded-xl">
                     <option value="CASHIER">Cashier (Restricted)</option>
                     <option value="MANAGER">Manager (Full Access)</option>
                   </select>
                   <input required placeholder="PIN Code (e.g. 1234)" type="password" value={newStaff.pin} onChange={e=>setNewStaff({...newStaff, pin: e.target.value})} className="bg-white p-3 rounded-xl" />
                   <button className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl">Create Staff</button>
                 </form>
               </div>
               
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider"><th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4">Action</th></tr>
                  </thead>
                  <tbody>
                    {staff.map(s => (
                      <tr key={s.id} className="border-b border-slate-50">
                        <td className="p-4 font-bold">{s.full_name}</td>
                        <td className="p-4"><span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold">{s.role}</span></td>
                        <td className="p-4"><button onClick={() => deleteStaff(s.id)} className="text-red-500 font-bold text-sm">Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           )}

           {activeTab === 'billing' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center bg-blue-50 p-6 rounded-2xl border border-blue-100">
                   <div>
                     <h3 className="text-xl font-black text-blue-900">Current Plan: {currentUser?.package_type}</h3>
                     <p className="text-blue-700 font-medium">Your subscription is active and in good standing.</p>
                   </div>
                   <div className="text-right">
                     <div className="text-xs font-bold text-blue-500 uppercase tracking-wider">Status</div>
                     <div className="text-lg font-black text-emerald-600 flex items-center gap-1"><ShieldCheck size={20}/> {currentUser?.status || 'ACTIVE'}</div>
                   </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl">
                   <h4 className="font-bold mb-2">Payment Method</h4>
                   <p className="text-slate-500 text-sm mb-4">Update your credit card to ensure uninterrupted service.</p>
                   <button className="bg-white border border-slate-200 text-slate-900 font-bold py-3 px-6 rounded-xl shadow-sm">Update Card (Stripe integration)</button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
export default ShopSettingsScreen;
