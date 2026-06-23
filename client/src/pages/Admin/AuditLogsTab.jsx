import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';

const AuditLogsTab = () => {
  const { token } = useAuthStore();
  const { addToast } = useToastStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/audit-logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs);
        } else {
          addToast('Failed to fetch audit logs', 'error');
        }
      } catch (error) {
        addToast('Network error', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  if (loading) return <div className="text-center py-8">Loading logs...</div>;

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold dark:text-white mb-6">System Audit Logs</h2>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white dark:bg-dark-bg z-10">
            <tr className="border-b dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
              <th className="pb-3 font-medium">Timestamp</th>
              <th className="pb-3 font-medium">Action</th>
              <th className="pb-3 font-medium">Description</th>
              <th className="pb-3 font-medium">User Role</th>
              <th className="pb-3 font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="py-3 text-sm dark:text-gray-300 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3 text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {log.actionType}
                </td>
                <td className="py-3 text-sm dark:text-gray-300">{log.description}</td>
                <td className="py-3 text-sm dark:text-gray-300">{log.userRole || '-'}</td>
                <td className="py-3 text-sm text-gray-500">{log.ipAddress || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsTab;
