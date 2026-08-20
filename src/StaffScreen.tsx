import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react';
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
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address (Login)</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
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
          staff.map(member => (
            <div key={member.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${member.role === 'admin' ? 'bg-amber-500' : member.role === 'manager' ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                  {member.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{member.fullName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${member.role === 'admin' ? 'bg-amber-100 text-amber-700' : member.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                  {member.role}
                </span>
                <button 
                  onClick={() => handleDelete(member.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffScreen;
