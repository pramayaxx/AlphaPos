import { api } from './api';
import React, { useState, useEffect } from 'react';
import { Store, Receipt, Users, CreditCard, ShieldCheck, AlertTriangle, KeyRound, Trash2, Globe, Cloud, Lock, Eye, EyeOff, Check, X, Key } from 'lucide-react';
import { LogoUploader } from './components/LogoUploader';


const ShopSettingsScreen = ({ currentUser, settings, setSettings, onPrinterSetup }: any) => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'receipt' | 'staff' | 'billing' | 'integrations'>('general');
  const [localSettings, setLocalSettings] = useState<any>(settings || { name: '', phone: '', address: '', receiptFooter: '' });
  const [staff, setStaff] = useState<any[]>([]);
  const [newStaff, setNewStaff] = useState({ full_name: '', phone: '', role: 'CASHIER', pin: '' });

  // Passcode change state (Wipe data)
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);
  const [passcodeForm, setPasscodeForm] = useState({ current: '', new: '', confirm: '' });
  const [showWipePasscode, setShowWipePasscode] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');

  // Account Password change state (Current User)
  const [accountPassForm, setAccountPassForm] = useState({ current: '', new: '', confirm: '' });
  const [showAccountPass, setShowAccountPass] = useState(false);
  const [accountPassStatus, setAccountPassStatus] = useState<{ loading: boolean; error: string; success: string }>({
    loading: false,
    error: '',
    success: ''
  });

  // Manager Override PIN change state
  const [managerPinForm, setManagerPinForm] = useState({ current: '', new: '', confirm: '', accountPassword: '' });
  const [showManagerPin, setShowManagerPin] = useState(false);
  const [managerPinStatus, setManagerPinStatus] = useState<{ loading: boolean; error: string; success: string }>({
    loading: false,
    error: '',
    success: ''
  });

  // Dedicated Wipe Passcode status state
  const [wipePassStatus, setWipePassStatus] = useState<{ loading: boolean; error: string; success: string }>({
    loading: false,
    error: '',
    success: ''
  });

  // Staff Credentials (PIN / Password) edit state
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [editStaffForm, setEditStaffForm] = useState({ full_name: '', role: '', pin: '', password: '', phone: '' });
  const [showStaffCredentials, setShowStaffCredentials] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [editStaffError, setEditStaffError] = useState('');

  const handleAccountPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountPassStatus({ loading: false, error: '', success: '' });
    if (!accountPassForm.current) {
      return setAccountPassStatus({ loading: false, error: 'Current password is required.', success: '' });
    }
    if (accountPassForm.new.length < 4) {
      return setAccountPassStatus({ loading: false, error: 'New password must be at least 4 characters.', success: '' });
    }
    if (accountPassForm.new !== accountPassForm.confirm) {
      return setAccountPassStatus({ loading: false, error: 'New passwords do not match.', success: '' });
    }

    setAccountPassStatus({ loading: true, error: '', success: '' });
    try {
      await api.post('/auth/change-password', {
        currentPassword: accountPassForm.current,
        newPassword: accountPassForm.new
      });
      setAccountPassStatus({ loading: false, error: '', success: 'Your account password has been updated successfully!' });
      setAccountPassForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setAccountPassStatus({ loading: false, error: err.message || 'Failed to update password', success: '' });
    }
  };

  const handleManagerPinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setManagerPinStatus({ loading: false, error: '', success: '' });
    if (!managerPinForm.new || managerPinForm.new.length < 3) {
      return setManagerPinStatus({ loading: false, error: 'New Manager PIN must be at least 3 digits/characters.', success: '' });
    }
    if (managerPinForm.new !== managerPinForm.confirm) {
      return setManagerPinStatus({ loading: false, error: 'New Manager PINs do not match.', success: '' });
    }

    setManagerPinStatus({ loading: true, error: '', success: '' });
    try {
      await api.post('/settings/change-manager-pin', {
        currentPin: managerPinForm.current || undefined,
        accountPassword: managerPinForm.accountPassword || undefined,
        newPin: managerPinForm.new
      });
      setManagerPinStatus({ loading: false, error: '', success: 'Manager Override PIN updated successfully!' });
      setManagerPinForm({ current: '', new: '', confirm: '', accountPassword: '' });
      setLocalSettings((prev: any) => ({ ...prev, manager_pin: managerPinForm.new }));
    } catch (err: any) {
      setManagerPinStatus({ loading: false, error: err.message || 'Failed to update Manager PIN', success: '' });
    }
  };

  const handleDirectWipePasscodeChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setWipePassStatus({ loading: false, error: '', success: '' });
    const currentStored = settings?.wipe_passcode || '12345';
    if (passcodeForm.current !== currentStored) {
      return setWipePassStatus({ loading: false, error: 'Current passcode is incorrect.', success: '' });
    }
    if (!passcodeForm.new || passcodeForm.new.length < 4) {
      return setWipePassStatus({ loading: false, error: 'New passcode must be at least 4 characters.', success: '' });
    }
    if (passcodeForm.new !== passcodeForm.confirm) {
      return setWipePassStatus({ loading: false, error: 'New passcodes do not match.', success: '' });
    }

    setWipePassStatus({ loading: true, error: '', success: '' });
    try {
      await api.post('/settings/change-wipe-passcode', {
        currentPasscode: passcodeForm.current,
        newPasscode: passcodeForm.new
      });
      const updatedSettings = { ...localSettings, wipe_passcode: passcodeForm.new };
      setLocalSettings(updatedSettings);
      setSettings(updatedSettings);
      setWipePassStatus({ loading: false, error: '', success: 'Store wipe passcode updated successfully!' });
      setPasscodeForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setWipePassStatus({ loading: false, error: err.message || 'Failed to update wipe passcode', success: '' });
    }
  };

  const openEditStaff = (member: any) => {
    setEditingStaff(member);
    setEditStaffForm({
      full_name: member.fullName || member.full_name || '',
      role: member.role || 'cashier',
      pin: member.pin || '',
      password: '',
      phone: member.phone || ''
    });
    setEditStaffError('');
    setShowStaffCredentials(false);
  };

  const saveStaffUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setIsSavingStaff(true);
    setEditStaffError('');
    try {
      await api.put(`/staff/${editingStaff.id}`, {
        full_name: editStaffForm.full_name,
        fullName: editStaffForm.full_name,
        role: editStaffForm.role,
        pin: editStaffForm.pin,
        password: editStaffForm.password || undefined,
        phone: editStaffForm.phone
      });
      alert('Staff PIN/Password and details updated successfully!');
      setEditingStaff(null);
      const res = await api.get('/staff');
      setStaff(res);
    } catch (err: any) {
      setEditStaffError(err.message || 'Failed to update staff credentials');
    } finally {
      setIsSavingStaff(false);
    }
  };

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
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-800 shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Shop Settings</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{currentUser?.package_type} PACKAGE</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
           <button onClick={() => setActiveTab('general')} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Store size={20}/> General</button>
           <button onClick={() => setActiveTab('security')} className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Lock size={20}/> Security & Passwords</button>
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
                             <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm mb-4 border border-rose-100 flex items-center gap-2">
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
                   
                   <div className="p-6 sm:p-8 bg-rose-50 dark:bg-rose-900/20/50 dark:bg-rose-500/5">
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

           {activeTab === 'security' && (
             <div className="space-y-8 max-w-xl">
               <div>
                 <h3 className="text-xl font-black mb-2 dark:text-white flex items-center gap-2">
                   <Lock className="text-blue-600 dark:text-blue-400" size={22} />
                   Security & Password Management
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400">
                   Manage your account login credentials, staff access PINs, and safety passcodes.
                 </p>
               </div>

               {/* Account Password Card */}
               <div className="bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                 <div className="flex items-center justify-between mb-4">
                   <div>
                     <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Key size={18} className="text-blue-600" />
                       Change Account Password
                     </h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                       Logged in as: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.email || 'Store Admin'}</span>
                     </p>
                   </div>
                   <button 
                     type="button" 
                     onClick={() => setShowAccountPass(!showAccountPass)}
                     className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                   >
                     {showAccountPass ? <EyeOff size={14} /> : <Eye size={14} />}
                     {showAccountPass ? 'Hide' : 'Show'}
                   </button>
                 </div>

                 {accountPassStatus.error && (
                   <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-sm mb-4 border border-rose-200 dark:border-rose-800/40 flex items-center gap-2">
                     <AlertTriangle size={16} className="shrink-0" />
                     <span>{accountPassStatus.error}</span>
                   </div>
                 )}

                 {accountPassStatus.success && (
                   <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-sm mb-4 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2">
                     <Check size={16} className="shrink-0" />
                     <span>{accountPassStatus.success}</span>
                   </div>
                 )}

                 <form onSubmit={handleAccountPasswordChange} className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Current Password</label>
                     <input 
                       type={showAccountPass ? "text" : "password"} 
                       required
                       value={accountPassForm.current}
                       onChange={e => setAccountPassForm({ ...accountPassForm, current: e.target.value })}
                       placeholder="Enter your current password"
                       className="w-full bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                   </div>

                   <div className="grid sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">New Password</label>
                       <input 
                         type={showAccountPass ? "text" : "password"} 
                         required
                         value={accountPassForm.new}
                         onChange={e => setAccountPassForm({ ...accountPassForm, new: e.target.value })}
                         placeholder="Min 4 characters"
                         className="w-full bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Confirm New Password</label>
                       <input 
                         type={showAccountPass ? "text" : "password"} 
                         required
                         value={accountPassForm.confirm}
                         onChange={e => setAccountPassForm({ ...accountPassForm, confirm: e.target.value })}
                         placeholder="Repeat new password"
                         className="w-full bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                     </div>
                   </div>

                   <div className="pt-2">
                     <button 
                       type="submit" 
                       disabled={accountPassStatus.loading}
                       className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                     >
                       <Lock size={16} />
                       {accountPassStatus.loading ? 'Updating Password...' : 'Update Password'}
                     </button>
                   </div>
                 </form>
               </div>

               {/* Manager Override PIN Card */}
               <div className="bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                 <div className="flex items-center justify-between mb-4">
                   <div>
                     <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <ShieldCheck size={18} className="text-emerald-600" />
                       Manager Override PIN
                     </h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                       Required for discounts, refunds, voids, and cash drawer actions. Default is <span className="font-mono font-bold text-slate-700 dark:text-slate-300">1234</span>.
                     </p>
                   </div>
                   <button 
                     type="button" 
                     onClick={() => setShowManagerPin(!showManagerPin)}
                     className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                   >
                     {showManagerPin ? <EyeOff size={14} /> : <Eye size={14} />}
                     {showManagerPin ? 'Hide' : 'Show'}
                   </button>
                 </div>

                 {managerPinStatus.error && (
                   <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-sm mb-4 border border-rose-200 dark:border-rose-800/40 flex items-center gap-2">
                     <AlertTriangle size={16} className="shrink-0" />
                     <span>{managerPinStatus.error}</span>
                   </div>
                 )}

                 {managerPinStatus.success && (
                   <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-sm mb-4 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2">
                     <Check size={16} className="shrink-0" />
                     <span>{managerPinStatus.success}</span>
                   </div>
                 )}

                 <form onSubmit={handleManagerPinChange} className="space-y-4">
                   <div className="grid sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                         Current Manager PIN
                       </label>
                       <input 
                         type={showManagerPin ? "text" : "password"} 
                         value={managerPinForm.current}
                         onChange={e => setManagerPinForm({ ...managerPinForm, current: e.target.value })}
                         placeholder="Current PIN (e.g. 1234)"
                         className="w-full bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                         Or Admin Password
                       </label>
                       <input 
                         type="password" 
                         value={managerPinForm.accountPassword}
                         onChange={e => setManagerPinForm({ ...managerPinForm, accountPassword: e.target.value })}
                         placeholder="Your account password"
                         className="w-full bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                       />
                     </div>
                   </div>

                   <div className="grid sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">New Manager PIN</label>
                       <input 
                         type={showManagerPin ? "text" : "password"} 
                         required
                         value={managerPinForm.new}
                         onChange={e => setManagerPinForm({ ...managerPinForm, new: e.target.value })}
                         placeholder="e.g. 5678 (Min 3 digits)"
                         className="w-full bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Confirm New PIN</label>
                       <input 
                         type={showManagerPin ? "text" : "password"} 
                         required
                         value={managerPinForm.confirm}
                         onChange={e => setManagerPinForm({ ...managerPinForm, confirm: e.target.value })}
                         placeholder="Repeat new PIN"
                         className="w-full bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                       />
                     </div>
                   </div>

                   <div className="pt-2">
                     <button 
                       type="submit" 
                       disabled={managerPinStatus.loading}
                       className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                     >
                       <ShieldCheck size={16} />
                       {managerPinStatus.loading ? 'Saving PIN...' : 'Update Manager PIN'}
                     </button>
                   </div>
                 </form>
               </div>

               {/* Wipe Passcode Card */}
               <div className="bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                 <div className="flex items-center justify-between mb-4">
                   <div>
                     <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <AlertTriangle size={18} className="text-amber-600" />
                       Store Wipe & Reset Passcode
                     </h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                       Passcode required before factory wiping store records. Default is <span className="font-mono font-bold text-slate-700 dark:text-slate-300">12345</span>.
                     </p>
                   </div>
                   <button 
                     type="button" 
                     onClick={() => setShowWipePasscode(!showWipePasscode)}
                     className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                   >
                     {showWipePasscode ? <EyeOff size={14} /> : <Eye size={14} />}
                     {showWipePasscode ? 'Hide' : 'Show'}
                   </button>
                 </div>

                 {wipePassStatus.error && (
                   <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-sm mb-4 border border-rose-200 dark:border-rose-800/40 flex items-center gap-2">
                     <AlertTriangle size={16} className="shrink-0" />
                     <span>{wipePassStatus.error}</span>
                   </div>
                 )}

                 {wipePassStatus.success && (
                   <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-sm mb-4 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2">
                     <Check size={16} className="shrink-0" />
                     <span>{wipePassStatus.success}</span>
                   </div>
                 )}

                 <form onSubmit={handleDirectWipePasscodeChange} className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Current Wipe Passcode</label>
                     <input 
                       type={showWipePasscode ? "text" : "password"} 
                       required
                       value={passcodeForm.current}
                       onChange={e => setPasscodeForm({ ...passcodeForm, current: e.target.value })}
                       placeholder="Default is 12345"
                       className="w-full bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                     />
                   </div>

                   <div className="grid sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">New Passcode</label>
                       <input 
                         type={showWipePasscode ? "text" : "password"} 
                         required
                         value={passcodeForm.new}
                         onChange={e => setPasscodeForm({ ...passcodeForm, new: e.target.value })}
                         placeholder="Min 4 characters"
                         className="w-full bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Confirm New Passcode</label>
                       <input 
                         type={showWipePasscode ? "text" : "password"} 
                         required
                         value={passcodeForm.confirm}
                         onChange={e => setPasscodeForm({ ...passcodeForm, confirm: e.target.value })}
                         placeholder="Repeat new passcode"
                         className="w-full bg-white dark:bg-slate-950 dark:text-white dark:border-slate-800 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                       />
                     </div>
                   </div>

                   <div className="pt-2">
                     <button 
                       type="submit" 
                       disabled={wipePassStatus.loading}
                       className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                     >
                       <Key size={16} />
                       {wipePassStatus.loading ? 'Saving Passcode...' : 'Update Wipe Passcode'}
                     </button>
                   </div>
                 </form>
               </div>

               {/* Team & Staff Passwords / PINs Card */}
               <div className="bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                 <div className="flex items-center justify-between mb-4">
                   <div>
                     <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Users size={18} className="text-blue-600" />
                       Team Members' Passwords & PINs
                     </h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                       Change the login password or cash register PIN for any staff member in one click.
                     </p>
                   </div>
                   <button 
                     onClick={() => setActiveTab('staff')}
                     className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                   >
                     + Add Staff
                   </button>
                 </div>

                 <div className="space-y-2.5">
                   {staff.length === 0 ? (
                     <p className="text-xs text-slate-400 italic py-2">No staff members created yet.</p>
                   ) : (
                     staff.map((member: any) => (
                       <div key={member.id} className="bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center text-xs">
                             {(member.fullName || member.full_name || 'S').charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <p className="text-xs font-bold text-slate-900 dark:text-white">{member.fullName || member.full_name}</p>
                             <p className="text-[10px] text-slate-400 font-mono">
                               {member.email ? `Email: ${member.email}` : `Role: ${member.role || 'CASHIER'}`}
                             </p>
                           </div>
                         </div>
                         <button
                           type="button"
                           onClick={() => openEditStaff(member)}
                           className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                         >
                           <KeyRound size={13} />
                           Change Password / PIN
                         </button>
                       </div>
                     ))
                   )}
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'receipt' && (
             <div className="space-y-6 max-w-xl">
               <h3 className="text-xl font-black mb-4 dark:text-white">Receipt Configuration</h3>
               <LogoUploader 
                 logoUrl={localSettings.logoUrl || localSettings.logo_url}
                 onLogoChange={(newLogo) => setLocalSettings({ ...localSettings, logoUrl: newLogo, logo_url: newLogo })}
               />
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
                      <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                        <th className="p-4">Name</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">PIN / Auth</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {staff.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-bold dark:text-white">
                            <div>{s.full_name || s.fullName}</div>
                            {s.email && <div className="text-xs font-normal text-slate-400">{s.email}</div>}
                          </td>
                          <td className="p-4"><span className="bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold">{s.role}</span></td>
                          <td className="p-4">
                            {s.pin ? (
                              <span className="font-mono text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-lg">
                                PIN: {s.pin}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 font-mono">Password protected</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openEditStaff(s)} 
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                                title="Change Staff Password or PIN"
                              >
                                <KeyRound size={13} /> Change PIN / Password
                              </button>
                              <button 
                                onClick={() => deleteStaff(s.id)} 
                                className="text-red-500 hover:text-red-600 dark:text-red-400 font-bold text-xs p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>

               {/* Edit Staff Credentials Modal */}
               {editingStaff && (
                 <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                     <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-2.5">
                         <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                           <KeyRound size={20} />
                         </div>
                         <div>
                           <h3 className="font-black text-lg text-slate-900 dark:text-white">Staff Credentials</h3>
                           <p className="text-xs text-slate-400">{editingStaff.full_name || editingStaff.fullName}</p>
                         </div>
                       </div>
                       <button onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                         <X size={20} />
                       </button>
                     </div>

                     {editStaffError && (
                       <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs mb-4 flex items-center gap-2 border border-rose-200 dark:border-rose-800/40">
                         <AlertTriangle size={15} className="shrink-0" />
                         <span>{editStaffError}</span>
                       </div>
                     )}

                     <form onSubmit={saveStaffUpdate} className="space-y-4">
                       <div>
                         <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                         <input 
                           required
                           type="text" 
                           value={editStaffForm.full_name} 
                           onChange={e => setEditStaffForm({ ...editStaffForm, full_name: e.target.value })}
                           className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                         />
                       </div>

                       <div>
                         <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Role</label>
                         <select 
                           value={editStaffForm.role} 
                           onChange={e => setEditStaffForm({ ...editStaffForm, role: e.target.value })}
                           className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                         >
                           <option value="CASHIER">Cashier (Restricted)</option>
                           <option value="MANAGER">Manager (Full Access)</option>
                           <option value="ADMIN">Admin (Full Store Control)</option>
                         </select>
                       </div>

                       <div>
                         <div className="flex items-center justify-between mb-1">
                           <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                             {editingStaff.email ? 'New Login Password' : 'New PIN Code'}
                           </label>
                           <button 
                             type="button" 
                             onClick={() => setShowStaffCredentials(!showStaffCredentials)}
                             className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                           >
                             {showStaffCredentials ? <EyeOff size={13} /> : <Eye size={13} />}
                             {showStaffCredentials ? 'Hide' : 'Show'}
                           </button>
                         </div>
                         <input 
                           type={showStaffCredentials ? "text" : "password"} 
                           value={editingStaff.email ? editStaffForm.password : (editStaffForm.pin || editStaffForm.password)} 
                           onChange={e => {
                             if (editingStaff.email) {
                               setEditStaffForm({ ...editStaffForm, password: e.target.value });
                             } else {
                               setEditStaffForm({ ...editStaffForm, pin: e.target.value, password: e.target.value });
                             }
                           }}
                           placeholder={editingStaff.email ? "Enter new login password" : "Enter new 4-digit PIN"}
                           className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                         />
                       </div>

                       <div className="flex gap-3 pt-4">
                         <button 
                           type="button" 
                           onClick={() => setEditingStaff(null)}
                           className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-sm transition-colors"
                         >
                           Cancel
                         </button>
                         <button 
                           type="submit" 
                           disabled={isSavingStaff}
                           className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                         >
                           {isSavingStaff ? 'Saving...' : 'Save Changes'}
                         </button>
                       </div>
                     </form>
                   </div>
                 </div>
               )}
             </div>
           )}

           {activeTab === 'integrations' && (
             <div className="space-y-6 max-w-xl">
               <h3 className="text-xl font-black mb-4 dark:text-white flex items-center gap-2">
                 <Cloud className="text-blue-600 dark:text-blue-400" />
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
               
               <h3 className="text-lg font-black mb-4 dark:text-white">Alpha POS Auto-Sync System</h3>
               <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl mb-8">
                 <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-4">
                   Copy the API URL below and paste it into your WhatsApp Bot's Shop Settings. This allows your bot to securely pull your latest products, prices, and inventory in real-time.
                 </p>
                 <div className="flex items-center gap-3">
                   <input 
                     type="text" 
                     readOnly 
                     value={`${window.location.origin}/api/external/sync/products?token=${settings?.bot_sync_token || 'generating...'}`}
                     className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 p-3 rounded-xl text-sm text-slate-700 dark:text-slate-300 font-mono outline-none"
                   />
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/external/sync/products?token=${settings?.bot_sync_token || ''}`);
                        alert('API URL copied to clipboard!');
                     }}
                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap"
                   >
                     Copy URL
                   </button>
                 </div>
               </div>

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
