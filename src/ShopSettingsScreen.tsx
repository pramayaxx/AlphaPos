import { api } from './api';
import React, { useState, useEffect } from 'react';
import { Store, Receipt, Users, CreditCard, ShieldCheck, AlertTriangle, KeyRound, Trash2, Globe, Cloud } from 'lucide-react';


const ShopSettingsScreen = ({ currentUser, settings, setSettings, onPrinterSetup }: any) => {
  const [activeTab, setActiveTab] = useState<'general' | 'receipt' | 'staff' | 'billing' | 'integrations'>('general');
  const [localSettings, setLocalSettings] = useState<any>(settings || { name: '', phone: '', address: '', receiptFooter: '' });
  const [staff, setStaff] = useState<any[]>([]);
  const [newStaff, setNewStaff] = useState({ full_name: '', phone: '', role: 'CASHIER', pin: '' });

  // Passcode change state
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);
  const [passcodeForm, setPasscodeForm] = useState({ current: '', new: '', confirm: '' });
  const [passcodeError, setPasscodeError] = useState('');

  const handleChangePasscode = async () => {
    setPasscodeError('');
    
    const currentStored = settings?.wipe_passcode || '12345';
    
    if (passcodeForm.current !== currentStored) {
      setPasscodeError('Current passcode is incorrect.');
      return;
    }
    
    if (!passcodeForm.new || passcodeForm.new.length < 4) {
      setPasscodeError('New passcode must be at least 4 characters.');
      return;
    }
    
    if (passcodeForm.new !== passcodeForm.confirm) {
      setPasscodeError('New passcodes do not match.');
      return;
    }
    
    try {
      const updatedSettings = { ...localSettings, wipe_passcode: passcodeForm.new };
      setLocalSettings(updatedSettings);
      const res = await api.post('/shop-settings', updatedSettings);
      setSettings(res);
      setIsChangingPasscode(false);
      setPasscodeForm({ current: '', new: '', confirm: '' });
      alert('Wipe passcode updated successfully!');
    } catch (err: any) {
      setPasscodeError(err.message || 'Failed to update passcode');
    }
  };

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
    <div className="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-800 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Shop Settings</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{currentUser?.package_type} PACKAGE</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
           <button onClick={() => setActiveTab('general')} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Store size={20}/> General</button>
           <button onClick={() => setActiveTab('receipt')} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'receipt' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Receipt size={20}/> Receipt config</button>
           <button onClick={() => setActiveTab('staff')} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'staff' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Users size={20}/> Staff & Roles</button>
           <button onClick={() => setActiveTab('billing')} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'billing' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><CreditCard size={20}/> SaaS Billing</button>
           <button onClick={() => setActiveTab('integrations')} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'integrations' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Globe size={20}/> Web & Cloud</button>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 h-fit">
           {activeTab === 'general' && (
             <div className="space-y-6 max-w-xl">
               <h3 className="text-xl font-black mb-4 dark:text-white">General Settings</h3>
               <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Store Name</label><input type="text" value={localSettings.name || ''} onChange={e=>setLocalSettings({...localSettings, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-transparent p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
               <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Phone</label><input type="text" value={localSettings.phone || ''} onChange={e=>setLocalSettings({...localSettings, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-transparent p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
               <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Address</label><textarea value={localSettings.address || ''} onChange={e=>setLocalSettings({...localSettings, address: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-transparent p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
               <button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">Save Changes</button>
               
               <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3 mb-6">
                   <AlertTriangle className="text-rose-500" size={24} />
                   <h3 className="text-2xl font-black text-rose-500 tracking-tight">Danger Zone</h3>
                 </div>
                 
                 <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                   
                   <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-700">
                     <div className="flex flex-col gap-4">
                       <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                         <div className="flex-1">
                           <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                             <KeyRound size={18} className="text-slate-400" />
                             Wipe Data Passcode
                           </h4>
                           <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                             Set a custom secure passcode. This code will be required whenever you attempt to permanently delete store data. Keep this safe.
                           </p>
                         </div>
                         
                         {!isChangingPasscode && (
                           <button 
                             onClick={() => setIsChangingPasscode(true)} 
                             className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap"
                           >
                             Change Passcode
                           </button>
                         )}
                       </div>
                       
                       {isChangingPasscode && (
                         <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mt-2">
                           <h5 className="font-bold text-slate-900 dark:text-white mb-4">Update Passcode</h5>
                           {passcodeError && (
                             <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm mb-4 border border-rose-100 flex items-center gap-2">
                               <AlertTriangle size={16} />
                               {passcodeError}
                             </div>
                           )}
                           <div className="space-y-4">
                             <div>
                               <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Current Passcode</label>
                               <input 
                                 type="password" 
                                 value={passcodeForm.current} 
                                 onChange={e => setPasscodeForm({...passcodeForm, current: e.target.value})}
                                 className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                                 placeholder="Enter current passcode"
                               />
                             </div>
                             <div className="grid sm:grid-cols-2 gap-4">
                               <div>
                                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">New Passcode</label>
                                 <input 
                                   type="password" 
                                   value={passcodeForm.new} 
                                   onChange={e => setPasscodeForm({...passcodeForm, new: e.target.value})}
                                   className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                                   placeholder="Min 4 characters"
                                 />
                               </div>
                               <div>
                                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Confirm New Passcode</label>
                                 <input 
                                   type="password" 
                                   value={passcodeForm.confirm} 
                                   onChange={e => setPasscodeForm({...passcodeForm, confirm: e.target.value})}
                                   className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                                   placeholder="Re-enter new passcode"
                                 />
                               </div>
                             </div>
                           </div>
                           <div className="flex gap-3 mt-6">
                             <button 
                               onClick={handleChangePasscode}
                               className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-2.5 px-6 rounded-xl transition-colors"
                             >
                               Save Passcode
                             </button>
                             <button 
                               onClick={() => {
                                 setIsChangingPasscode(false);
                                 setPasscodeError('');
                                 setPasscodeForm({ current: '', new: '', confirm: '' });
                               }}
                               className="bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-6 rounded-xl transition-colors"
                             >
                               Cancel
                             </button>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                   
                   <div className="p-6 sm:p-8 bg-rose-50/50 dark:bg-rose-500/5">
                     <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                       <div className="flex-1">
                         <h4 className="text-base font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-1">
                           <Trash2 size={18} className="text-rose-500 dark:text-rose-400" />
                           Wipe All System Data
                         </h4>
                         <p className="text-sm text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
                           This action is irreversible. It will permanently delete all bills, products, customers, transactions, and test data. Your account will be logged out immediately.
                         </p>
                       </div>
                       <button 
                         onClick={async () => {
                           const code = window.prompt('WARNING: This will permanently delete ALL your data. Please enter the wipe passcode to confirm:');
                           if (code !== null) {
                             const { resetDatabase } = await import('./db');
                             await resetDatabase(code);
                           }
                         }}
                         className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap flex justify-center items-center gap-2"
                       >
                         Wipe Data & Logout
                       </button>
                     </div>
                   </div>
                   
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'receipt' && (
             <div className="space-y-6 max-w-xl">
               <h3 className="text-xl font-black mb-4 dark:text-white">Receipt Configuration</h3>
               <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Footer Message (e.g. Thank you, come again!)</label><textarea value={localSettings.receiptFooter || ''} onChange={e=>setLocalSettings({...localSettings, receiptFooter: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-transparent p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
               <button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl mt-4 transition-colors">Save Receipt Settings</button>
               <hr className="my-8 border-slate-100 dark:border-slate-800" />
               <button onClick={onPrinterSetup} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl w-full text-center transition-colors">Configure Printer</button>
             </div>
           )}

           {activeTab === 'staff' && (
             <div>
               <h3 className="text-xl font-black mb-4 dark:text-white">Staff & Roles</h3>
               <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl mb-8 border border-transparent dark:border-slate-800">
                 <h4 className="font-bold mb-4 dark:text-white">Add Staff Member</h4>
                 <form onSubmit={addStaff} className="grid grid-cols-2 gap-4">
                   <input required placeholder="Full Name" value={newStaff.full_name} onChange={e=>setNewStaff({...newStaff, full_name: e.target.value})} className="bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-transparent p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                   <input placeholder="Phone" value={newStaff.phone} onChange={e=>setNewStaff({...newStaff, phone: e.target.value})} className="bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-transparent p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                   <select value={newStaff.role} onChange={e=>setNewStaff({...newStaff, role: e.target.value})} className="bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-transparent p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                     <option value="CASHIER">Cashier (Restricted)</option>
                     <option value="MANAGER">Manager (Full Access)</option>
                   </select>
                   <input required placeholder="PIN Code (e.g. 1234)" type="password" value={newStaff.pin} onChange={e=>setNewStaff({...newStaff, pin: e.target.value})} className="bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-transparent p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                   <button className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">Create Staff</button>
                 </form>
               </div>
               
               <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider"><th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {staff.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-bold dark:text-white">{s.full_name}</td>
                          <td className="p-4"><span className="bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold">{s.role}</span></td>
                          <td className="p-4"><button onClick={() => deleteStaff(s.id)} className="text-red-500 hover:text-red-600 font-bold text-sm transition-colors">Remove</button></td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
             </div>
           )}

           {activeTab === 'integrations' && (
             <div className="space-y-6 max-w-xl">
               <h3 className="text-xl font-black mb-4 dark:text-white flex items-center gap-2">
                 <Cloud className="text-blue-600" />
                 Cloud Sync & Web
               </h3>
               
               <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-6 rounded-2xl mb-6">
                 <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-2">
                   <ShieldCheck size={20} /> Real-time Cloud Sync Active
                 </h4>
                 <p className="text-sm text-emerald-700/80 dark:text-emerald-500/80 font-medium">
                   Your data is securely stored and synced in real-time to your Cloud Database instance. No manual backup is needed. You can access this system from any device.
                 </p>
               </div>

               <hr className="my-8 border-slate-100 dark:border-slate-800" />
               
               <h3 className="text-lg font-black mb-4 dark:text-white">E-commerce Integrations</h3>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                   <div>
                     <h4 className="font-bold text-slate-900 dark:text-slate-100">Shopify</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sync products and online orders</p>
                   </div>
                   <button onClick={() => alert('Shopify OAuth integration required. Please contact administrator.')} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Connect</button>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                   <div>
                     <h4 className="font-bold text-slate-900 dark:text-slate-100">WooCommerce</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sync inventory via Webhooks</p>
                   </div>
                   <button onClick={() => alert('WooCommerce Webhook URL generation required. Please contact administrator.')} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Connect</button>
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'billing' && (
             <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 gap-4">
                   <div>
                     <h3 className="text-xl font-black text-blue-900 dark:text-blue-400">Current Plan: {currentUser?.package_type}</h3>
                     <p className="text-blue-700 dark:text-blue-500/80 font-medium">Your subscription is active and in good standing.</p>
                   </div>
                   <div className="text-left sm:text-right">
                     <div className="text-xs font-bold text-blue-500 dark:text-blue-500/80 uppercase tracking-wider mb-1">Status</div>
                     <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><ShieldCheck size={20}/> {currentUser?.status || 'ACTIVE'}</div>
                   </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-transparent dark:border-slate-800">
                   <h4 className="font-bold mb-2 dark:text-white">Payment Method</h4>
                   <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Update your credit card to ensure uninterrupted service.</p>
                   <button className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-colors">Update Card (PayHere integration)</button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
export default ShopSettingsScreen;
