import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, FileText, User } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const WardenDashboard = () => {
  const [passes, setPasses] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const { token, user } = useAuthStore();
  const location = useLocation();

  const fetchPasses = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gatepass`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPasses(data.gatePasses);
      }
    } catch (error) {
      console.error('Error fetching passes:', error);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, [token]);

  const handleAction = async (id, action, reason = '') => {
    setLoadingId(id);
    try {
      const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
      const body = { status };
      if (reason) body.rejection_reason = reason;

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gatepass/${id}/status`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchPasses();
      }
    } catch (error) {
      console.error('Error updating pass:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const pendingPasses = passes.filter(p => p.status === 'PENDING_WARDEN');
  const historyPasses = passes.filter(p => p.status !== 'PENDING_WARDEN');

  // Analytics Data Preparation
  const statusCounts = passes.reduce((acc, pass) => {
    acc[pass.status] = (acc[pass.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'Pending', value: (statusCounts['PENDING_HOD'] || 0) + (statusCounts['PENDING_WARDEN'] || 0) },
    { name: 'Approved', value: (statusCounts['APPROVED'] || 0) + (statusCounts['EXITED'] || 0) },
    { name: 'Rejected', value: statusCounts['REJECTED'] || 0 },
  ];
  const COLORS = ['#F59E0B', '#10B981', '#EF4444'];

  const recentDays = Array.from({length: 5}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - i));
    return d.toISOString().split('T')[0];
  });

  const barData = recentDays.map(date => {
    const dayPasses = passes.filter(p => p.created_at && p.created_at.startsWith(date));
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      requests: dayPasses.length
    };
  });

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold dark:text-white">Warden Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">Overview and analytics for your blocks</p>
      </div>

      {location.pathname === '/' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 border-l-4 border-l-primary-500">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Processed</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{historyPasses.length}</p>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-yellow-500">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Action Required</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{pendingPasses.length}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold dark:text-white mb-6">Requests (Last 5 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} allowDecimals={false} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="requests" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-bold dark:text-white mb-6">Overall Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-6 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></span>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Requires Action</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingPasses.length === 0 ? (
                <div className="col-span-full p-8 text-center glass-card">
                  <p className="text-gray-500 dark:text-gray-400">No pending requests for your block at the moment.</p>
                </div>
              ) : (
                pendingPasses.map((pass) => (
                  <motion.div key={pass.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 flex flex-col border-t-4 border-t-primary-500">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden">
                          {pass.student.profile_image ? (
                            <img src={(pass.student.profile_image?.startsWith('http') ? pass.student.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${pass.student.profile_image}`)} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{pass.student.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Block {pass.student.hostel_block}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-full">
                        Requires Approval
                      </span>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Reason</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{pass.reason}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Out Date</p>
                          <p className="text-sm font-medium dark:text-gray-200">{new Date(pass.out_date).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Return Date</p>
                          <p className="text-sm font-medium dark:text-gray-200">{new Date(pass.return_date).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button disabled={loadingId === pass.id} onClick={() => { const reason = prompt('Enter rejection reason (optional):'); if (reason !== null) handleAction(pass.id, 'reject', reason); }} className="flex-1 flex items-center justify-center py-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl font-medium transition-colors">
                        <X size={18} className="mr-1" /> Reject
                      </button>
                      <button disabled={loadingId === pass.id} onClick={() => handleAction(pass.id, 'approve')} className="flex-1 flex items-center justify-center py-2.5 bg-blue-500 text-white hover:bg-blue-600 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20">
                        <Check size={18} className="mr-1" /> Final Approve
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {historyPasses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Past Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {historyPasses.map((pass) => (
                  <div key={pass.id} className="glass-card p-6 flex flex-col opacity-75">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 overflow-hidden">
                          {pass.student.profile_image ? (
                            <img src={(pass.student.profile_image?.startsWith('http') ? pass.student.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${pass.student.profile_image}`)} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{pass.student.name}</h3>
                          <p className="text-sm text-gray-500">Block {pass.student.hostel_block}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${pass.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {pass.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-800 dark:text-gray-300"><span className="text-gray-500 font-semibold uppercase text-xs">Reason:</span> {pass.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WardenDashboard;
