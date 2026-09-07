import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User as UserIcon, KeyRound, Eye, EyeOff, X, Check, AlertCircle } from 'lucide-react';
import { api } from './api';
import { User } from './db';

const StaffScreen = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('cashier');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit / Password change state
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState('cashier');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);
  const [editStatus, setEditStatus] = useState<{ loading: boolean; error: string | null; success: string | null }>({
    loading: false,
    error: null,
    success: null,
  });

  const fetchStaff = async () => {
    try {
      const data = await api.get('/staff');
      setStaff(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;
    setIsSubmitting(true);
    try {
      await api.post('/staff', { email, password, fullName, role });
      setShowAdd(false);
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('cashier');
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Failed to add staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Failed to delete staff');
    }
  };

  const openEdit = (member: any) => {
    setEditingStaff(member);
    setEditFullName(member.fullName || member.full_name || '');
    setEditRole(member.role || 'cashier');
    setEditPassword('');
    setShowEditPass(false);
    setEditStatus({ loading: false, error: null, success: null });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setEditStatus({ loading: true, error: null, success: null });
    try {
      await api.put(`/staff/${editingStaff.id}`, {
        fullName: editFullName,
        full_name: editFullName,
        role: editRole,
        password: editPassword || undefined,
        pin: editPassword || undefined,
      });
      setEditStatus({ loading: false, error: null, success: 'Credentials updated successfully!' });
      setTimeout(() => {
        setEditingStaff(null);
        fetchStaff();
      }, 1000);
    } catch (err: any) {
      setEditStatus({ loading: false, error: err.message || 'Failed to update credentials', success: null });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Staff Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage employee accounts and permissions</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <UserPlus size={20} />
          Add Staff
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Add New Staff Member</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Create a separate login for an employee</p>
            </div>
          </div>
          <form onSubmit={handleAdd} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address (Login)</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Manager (Admin)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setShowAdd(false)}
                className="px-6 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl border-dashed">
            <UserPlus className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No staff members added yet</p>
            <p className="text-xs text-slate-400 mt-1">Add staff to give them separate logins to your store.</p>
          </div>
        ) : (
          staff.map(member => {
            const displayName = member.fullName || member.full_name || 'Staff Member';
            return (
              <div key={member.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${member.role === 'admin' ? 'bg-amber-500' : member.role === 'manager' ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{displayName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{member.email || 'PIN-based account'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${member.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : member.role === 'manager' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                    {member.role}
                  </span>
                  <button 
                    onClick={() => openEdit(member)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                    title="Change Password or PIN"
                  >
                    <KeyRound size={13} className="text-blue-600 dark:text-blue-400" />
                    <span>Change</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    title="Remove Staff"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Staff Password & Role Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Edit Staff Credentials</h3>
                  <p className="text-xs text-slate-400">{editingStaff.email || editingStaff.fullName || 'Staff User'}</p>
                </div>
              </div>
              <button onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {editStatus.error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs mb-4 flex items-center gap-2 border border-rose-200 dark:border-rose-800/40">
                <AlertCircle size={15} className="shrink-0" />
                <span>{editStatus.error}</span>
              </div>
            )}

            {editStatus.success && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-xs mb-4 flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/40">
                <Check size={15} className="shrink-0" />
                <span>{editStatus.success}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Role</label>
                <select 
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Manager (Admin)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                    New Password / PIN (Leave empty to keep unchanged)
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setShowEditPass(!showEditPass)}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {showEditPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showEditPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input 
                  type={showEditPass ? "text" : "password"} 
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  placeholder="Enter new password or PIN"
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
                  disabled={editStatus.loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                >
                  {editStatus.loading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffScreen;
