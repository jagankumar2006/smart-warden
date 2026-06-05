import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Settings, ShieldAlert, Edit2, CheckCircle, XCircle } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';

const AdminDashboard = () => {
  const { token, user } = useAuthStore();
  const { addToast } = useToastStore();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ users: {}, passes: {} });
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRole, setEditRole] = useState('');

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (usersRes.ok && statsRes.ok) {
        const usersData = await usersRes.json();
        const statsData = await statsRes.json();
        setUsers(usersData.users);
        setStats(statsData.stats);
      } else {
        addToast('Failed to fetch admin data', 'error');
      }
    } catch (error) {
      console.error(error);
      addToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleUpdateRole = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role: editRole })
      });

      if (res.ok) {
        addToast('User role updated successfully', 'success');
        setEditingUserId(null);
        fetchData(); // Refresh the list
      } else {
        const errorData = await res.json().catch(() => null);
        addToast(errorData?.message || 'Failed to update role', 'error');
      }
    } catch (error) {
      console.error(error);
      addToast('Network error', 'error');
    }
  };

  const totalUsers = Object.values(stats.users || {}).reduce((a, b) => a + b, 0);
  const totalPasses = Object.values(stats.passes || {}).reduce((a, b) => a + b, 0);
  const pendingPasses = (stats.passes?.PENDING_HOD || 0) + (stats.passes?.PENDING_WARDEN || 0);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
          Admin Control Center
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage users and monitor system health.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Users</p>
              <h3 className="text-3xl font-bold dark:text-white mt-1">{totalUsers}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Passes Issued</p>
              <h3 className="text-3xl font-bold dark:text-white mt-1">{totalPasses}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
              <FileText size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Approvals</p>
              <h3 className="text-3xl font-bold dark:text-white mt-1">{pendingPasses}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
        <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
          <Settings className="text-primary-500" />
          User Management
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Department/Block</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 font-medium dark:text-white">{u.name}</td>
                  <td className="py-4 text-gray-600 dark:text-gray-400 text-sm">{u.email}</td>
                  <td className="py-4">
                    {editingUserId === u.id ? (
                      <select 
                        value={editRole} 
                        onChange={(e) => setEditRole(e.target.value)}
                        className="input-field py-1 px-2 text-sm"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="HOD">HOD</option>
                        <option value="WARDEN">WARDEN</option>
                        <option value="SECURITY">SECURITY</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'HOD' ? 'bg-blue-100 text-blue-700' :
                          u.role === 'WARDEN' ? 'bg-indigo-100 text-indigo-700' :
                          u.role === 'SECURITY' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-gray-600 dark:text-gray-400 text-sm">
                    {u.department ? u.department : u.block ? `Block ${u.block}` : '-'}
                  </td>
                  <td className="py-4 text-right">
                    {editingUserId === u.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdateRole(u.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => setEditingUserId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingUserId(u.id); setEditRole(u.role); }} 
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        disabled={u.id === user.id} // Don't let admin demote themselves easily here
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">No users found in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
